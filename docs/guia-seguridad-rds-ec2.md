# Guía completa: asegurar RDS y desplegar Comercial 360 en EC2

Esta guía documenta el procedimiento realizado para:

- invalidar credenciales que hayan quedado publicadas en Git;
- dejar PostgreSQL (RDS) accesible únicamente desde EC2;
- desplegar frontend y backend en una instancia EC2;
- mantener una dirección pública estable mediante una Elastic IP;
- cargar los datos de demostración y reemplazar la contraseña pública del administrador;
- actualizar el servidor cuando haya cambios en el repositorio.

> **Nunca escribas en este documento valores reales de contraseñas, secretos, llaves `.pem`, endpoints privados o credenciales de AWS.** Usa los marcadores indicados.

## Arquitectura final

```text
Internet
   │
   ├── HTTP 80 ──▶ EC2 (nginx)
   │                  ├── /        → frontend React
   │                  └── /api/... → backend NestJS (PM2, puerto local 3000)
   │                                      │
   │                                      └── PostgreSQL 5432 ──▶ RDS
   │
   └── SSH 22 ──▶ EC2, únicamente desde las IP autorizadas

RDS no tiene acceso público y solo acepta el puerto 5432 desde el Security Group de EC2.
```

## Datos que se deben identificar

Antes de crear recursos, anota de forma privada:

```text
Región: <REGION_AWS>
VPC de RDS: <VPC_ID>
Endpoint de RDS: <RDS_ENDPOINT>
Usuario maestro de RDS: <RDS_USER>
Base inicial: <RDS_DATABASE>
```

En AWS se consultan en **RDS → Databases → instancia → Connectivity & security / Configuration**.

EC2 y RDS deben estar en la misma región y, para esta configuración, en la misma VPC.

## 1. Rotar inmediatamente una contraseña de RDS expuesta

Eliminar una contraseña de un archivo no la elimina de commits antiguos. Si estuvo en un repositorio público, se considera comprometida.

1. Abre **RDS → Databases → instancia → Modify**.
2. En **Credentials settings**, establece una contraseña nueva y única.
3. Selecciona **Apply immediately**.
4. Espera hasta que la instancia vuelva al estado **Available**.
5. Guarda la contraseña únicamente en un gestor de contraseñas y, posteriormente, en el `.env` privado de EC2.

La contraseña antigua queda invalidada aunque todavía aparezca en el historial de Git. Limpiar el historial es una tarea adicional que requiere coordinación con todo el equipo, porque implica reescribir commits y hacer `force push`.

## 2. Crear el Security Group de EC2

Al crear la instancia, usa un Security Group independiente, por ejemplo `comercial360-ec2`.

Reglas de entrada:

| Tipo | Puerto | Origen | Uso |
|---|---:|---|---|
| SSH | 22 | `TU_IP/32` | Administración del servidor |
| HTTP | 80 | `0.0.0.0/0` | Acceso web y validación futura de HTTPS |

No agregues entradas para `3000` ni `5432`:

- nginx accede al backend localmente por `127.0.0.1:3000`;
- EC2 inicia la conexión hacia RDS, por lo que no recibe conexiones en `5432`.

Nunca abras SSH a `0.0.0.0/0`.

## 3. Crear la instancia EC2

En **EC2 → Instances → Launch instances**:

```text
Nombre: comercial360-ec2
AMI: Ubuntu Server 24.04 LTS oficial de Canonical, x86_64
Tipo: t3.micro (o el tamaño aprobado para la cuenta)
VPC: <VPC_ID>, la misma de RDS
Subnet: preferiblemente una de la misma zona de disponibilidad de RDS
Auto-assign public IP: Enable
Security Group: comercial360-ec2
Almacenamiento inicial: 8 GiB gp3
```

Crea una llave RSA en formato `.pem` y guárdala de forma privada. No se debe subir a Git, enviar por chat ni compartir entre integrantes. Para acceso permanente de otra persona, crea un usuario y una llave separados.

## 4. Crear el Security Group de RDS

Crea otro grupo, por ejemplo `comercial360-rds`, en la misma VPC.

Su única regla de entrada para PostgreSQL debe ser:

```text
Tipo: PostgreSQL
Protocolo: TCP
Puerto: 5432
Origen: <SECURITY_GROUP_EC2>
```

El origen debe ser el identificador `sg-...` de `comercial360-ec2`, no la IP pública de EC2 y nunca `0.0.0.0/0`.

Después, en **RDS → instancia → Modify → Connectivity**:

1. Asocia `comercial360-rds`.
2. Retira el grupo `default` si era el grupo inseguro anterior.
3. Configura **Publicly accessible: No**.
4. Selecciona **Apply immediately**.
5. Espera hasta que RDS vuelva a **Available**.

Verificación final:

```text
Publicly accessible: No
Security Group activo: comercial360-rds
Entrada PostgreSQL 5432: origen comercial360-ec2
```

## 5. Conectarse a EC2 por SSH

### Windows PowerShell

OpenSSH rechaza una llave visible para otros usuarios. Corrige sus permisos:

```powershell
$keyPath = "$env:USERPROFILE\Downloads\comercial360-key.pem"
icacls $keyPath /inheritance:r
icacls $keyPath /grant:r "${env:USERNAME}:(R)"
```

Conéctate:

```powershell
ssh -i $keyPath ubuntu@<IP_PUBLICA_EC2>
```

### Ubuntu

```bash
chmod 600 ~/Downloads/comercial360-key.pem
ssh -i ~/Downloads/comercial360-key.pem ubuntu@<IP_PUBLICA_EC2>
```

La IP del computador desde el que se ejecuta SSH debe estar autorizada con una regla `TU_IP/32` en el Security Group de EC2.

## 6. Instalar Node.js, nginx, Git, rsync y PM2

Dentro de EC2:

```bash
sudo apt-get update
sudo apt-get install -y curl git nginx rsync
curl -fsSL https://deb.nodesource.com/setup_24.x -o /tmp/nodesource_setup.sh
sudo bash /tmp/nodesource_setup.sh
sudo apt-get install -y nodejs
sudo npm install -g pm2
```

Verifica:

```bash
node --version
npm --version
nginx -v
pm2 --version
```

Node debe mostrar la versión mayor `24`.

## 7. Clonar el repositorio y preparar nginx

```bash
cd ~
git clone https://github.com/MateoMg06/Plataforma-De-Gesti-n-Comercial.git comercial360
cd ~/comercial360
git switch develop
```

Descarga el certificado raíz para validar TLS de RDS:

```bash
mkdir -p ~/.postgresql
curl -fL -o ~/.postgresql/global-bundle.pem https://truststore.pki.rds.amazonaws.com/global/global-bundle.pem
```

Instala la configuración de nginx incluida en el repositorio:

```bash
sudo cp deploy/nginx.conf /etc/nginx/sites-available/comercial360
sudo ln -sf /etc/nginx/sites-available/comercial360 /etc/nginx/sites-enabled/comercial360
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl reload nginx
```

`sudo nginx -t` debe indicar que la sintaxis y la prueba fueron exitosas.

## 8. Probar EC2 → RDS antes de desplegar

Instala el cliente de PostgreSQL:

```bash
sudo apt-get install -y postgresql-client
```

Conéctate sin incluir la contraseña en el comando:

```bash
psql "host=<RDS_ENDPOINT> port=5432 dbname=<RDS_DATABASE> user=<RDS_USER> sslmode=verify-full sslrootcert=/home/ubuntu/.postgresql/global-bundle.pem"
```

`psql` solicitará la contraseña de forma interactiva. Una conexión exitosa confirma simultáneamente la ruta de red, el Security Group, el usuario, la contraseña y TLS.

Sal con:

```text
\q
```

## 9. Crear el `.env` privado del backend

```bash
cd ~/comercial360
cp backend/.env.example backend/.env
openssl rand -hex 32
nano backend/.env
```

El resultado de `openssl` se usa como `BETTER_AUTH_SECRET` y no se comparte.

Ejemplo de configuración:

```env
PORT=3000
FRONTEND_URL=http://<IP_PUBLICA_EC2>

DB_HOST=<RDS_ENDPOINT>
DB_PORT=5432
DB_USER=<RDS_USER>
DB_PASSWORD=<CONTRASENA_RDS>
DB_NAME=<RDS_DATABASE>
DB_SSL=true
DB_SSL_CA=/home/ubuntu/.postgresql/global-bundle.pem

AWS_REGION=<REGION_AWS>
S3_BUCKET=
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=

BETTER_AUTH_SECRET=<SECRETO_GENERADO>
BETTER_AUTH_URL=http://<IP_PUBLICA_EC2>
```

Protege y verifica el archivo:

```bash
chmod 600 backend/.env
git check-ignore backend/.env
```

El último comando debe responder `backend/.env`. Nunca uses `git add -f` con este archivo.

## 10. Desplegar

Desde la raíz del repositorio:

```bash
cd ~/comercial360
bash deploy/desplegar.sh develop
```

El script realiza:

```text
git fetch y pull
→ npm ci
→ build y pruebas del backend
→ migraciones de RDS
→ build del frontend
→ copia del frontend a nginx
→ inicio o recarga del backend con PM2
→ comprobación de /api/health
```

El resultado esperado es:

```text
Listo: Comercial 360 desplegado desde develop
```

## 11. Resolver `Killed` por falta de memoria

Una instancia pequeña puede quedarse sin RAM al compilar mientras el backend está activo. Primero intenta:

```bash
pm2 stop comercial360-api
cd ~/comercial360/backend
npm run seed
pm2 restart comercial360-api
pm2 save
```

Si vuelve a aparecer `Killed`, agrega 2 GiB de swap una sola vez:

```bash
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
free -h
```

Antes de repetir estos comandos, comprueba `sudo swapon --show` para no crear una segunda entrada de swap.

## 12. Cargar datos de demostración

Solo para la base de demostración:

```bash
cd ~/comercial360/backend
npm run seed
```

El seed crea usuarios, catálogos y datos de muestra. Puede ejecutarse nuevamente porque omite los registros existentes. Si un usuario ya existía, conserva su contraseña anterior.

No ejecutes el seed en una base de producción.

## 13. Cambiar la contraseña pública del administrador

La credencial inicial del seed está documentada públicamente y solo sirve para el primer ingreso. Debe reemplazarse inmediatamente.

1. Inicia sesión como administrador con la credencial inicial documentada en el README.
2. Abre las herramientas del navegador con `F12` y entra en **Console**.
3. Ejecuta el siguiente bloque:

```javascript
(async () => {
  const currentPassword = prompt('Contraseña actual');
  const newPassword = prompt('Contraseña nueva');

  const response = await fetch('/api/auth/change-password', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      currentPassword,
      newPassword,
      revokeOtherSessions: true,
    }),
  });

  console.log('Resultado:', response.status);
})();
```

El resultado esperado es `200`. Cierra sesión y verifica que la contraseña antigua ya no funcione.

Este endpoint exige una sesión válida y la contraseña actual. Mientras el sitio siga en HTTP, realiza el cambio únicamente desde una red privada confiable. La solución definitiva es configurar dominio y HTTPS.

## 14. Configurar PM2 para sobrevivir reinicios

```bash
pm2 startup
```

Copia y ejecuta exactamente el comando que PM2 imprime. Después:

```bash
pm2 save
sudo reboot
```

Tras el reinicio, vuelve a entrar y verifica:

```bash
pm2 status
sudo systemctl is-active nginx
curl http://127.0.0.1:3000/api/health
```

El proceso `comercial360-api` debe aparecer `online` y nginx debe aparecer `active`.

## 15. Asociar una Elastic IP

Una IP pública automática puede cambiar cuando la instancia se detiene. En **EC2 → Elastic IP addresses**:

1. Asigna una Elastic IP.
2. Selecciónala y usa **Actions → Associate Elastic IP address**.
3. Asóciala a `comercial360-ec2`.

La sesión SSH actual puede cerrarse. Reconecta usando la nueva dirección y actualiza:

```env
FRONTEND_URL=http://<ELASTIC_IP>
BETTER_AUTH_URL=http://<ELASTIC_IP>
```

Luego:

```bash
pm2 restart comercial360-api
pm2 save
```

Las direcciones IPv4 públicas pueden generar cobros. No dejes Elastic IP sin asociar y no liberes la dirección mientras exista un registro DNS que apunte a ella.

## 16. Publicar cambios nuevos del repositorio

Los cambios de GitHub no llegan automáticamente a EC2.

Flujo recomendado:

1. Trabaja en una rama `feature/HU-XX-descripcion`.
2. Haz commit y push.
3. Abre un Pull Request hacia `develop`.
4. Después del merge, entra a EC2 y ejecuta:

```bash
cd ~/comercial360
bash deploy/desplegar.sh develop
```

Para desplegar la versión estable después de integrar `develop` en `main`:

```bash
bash deploy/desplegar.sh main
```

No edites código directamente en EC2. El `.env` se conserva entre despliegues porque Git lo ignora.

## 17. Entrar por SSH desde otro computador

Para un equipo propio adicional:

1. Autoriza su IP pública con una nueva regla `SSH 22 → NUEVA_IP/32`.
2. Transfiere la llave mediante un medio privado.
3. Protege la llave con `icacls` en Windows o `chmod 600` en Ubuntu.
4. Conéctate a la Elastic IP.

Para otro integrante del equipo, no compartas la llave principal: crea un usuario y una llave independientes para poder revocar su acceso sin afectar a los demás.

## Lista final de verificación

- [ ] La contraseña antigua de RDS ya no funciona.
- [ ] RDS muestra **Publicly accessible: No**.
- [ ] RDS usa un Security Group independiente.
- [ ] La única entrada PostgreSQL es `5432` desde el Security Group de EC2.
- [ ] EC2 no expone los puertos `3000` ni `5432`.
- [ ] SSH solo está permitido desde IP concretas `/32`.
- [ ] `backend/.env` está ignorado por Git y tiene permisos `600`.
- [ ] La aplicación responde en `/` y `/api/health`.
- [ ] La contraseña inicial del administrador fue reemplazada.
- [ ] PM2 y nginx vuelven a iniciar después de un reinicio.
- [ ] La Elastic IP está asociada a la instancia.
- [ ] Ninguna llave `.pem`, contraseña o secreto fue añadido al repositorio.

## Evidencias recomendadas

Para la entrega, toma capturas sin mostrar secretos de:

1. RDS con acceso público desactivado.
2. La regla `5432` cuyo origen sea el Security Group de EC2.
3. EC2 en estado `Running`.
4. PM2 con `comercial360-api` en estado `online`.
5. `/api/health` respondiendo.
6. Inicio de sesión exitoso después de cambiar la contraseña del administrador.

