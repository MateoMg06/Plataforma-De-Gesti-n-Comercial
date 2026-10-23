# Despliegue en AWS (HU-INF-03)

Cómo queda Comercial 360 en AWS:

```
Navegador ──80──▶ EC2 (nginx) ──┬── /        → frontend compilado (/var/www/comercial360)
                                └── /api/... → backend NestJS con pm2 (127.0.0.1:3000)
                                                  ├──5432──▶ RDS PostgreSQL (HU-INF-02)
                                                  └────────▶ S3 documentos (HU-29, rol IAM)
```

Frontend y API salen por la **misma dirección**, así la cookie de sesión de BetterAuth funciona sin CORS.
Todo en la región **us-east-2 (Ohio)**, la misma de la base RDS.

Archivos del repositorio que se usan:

| Archivo | Para qué |
|---|---|
| `deploy/nginx.conf` | Sirve el frontend y pasa `/api` al backend |
| `deploy/ecosystem.config.cjs` | pm2: mantiene vivo el backend y lo reinicia |
| `deploy/desplegar.sh` | Actualiza el código, compila, prueba, migra y reinicia |

## 1. Recursos en AWS (consola)

1. **Security group del EC2** (`comercial360-ec2`): entrada 80 (HTTP) desde `0.0.0.0/0` y 22 (SSH) **solo desde tu IP**. El puerto 3000 no se abre.
2. **Security group de RDS**: entrada 5432 **solo desde el security group `comercial360-ec2`** (no desde Internet). La base debe quedar sin acceso público.
3. **Bucket S3** `comercial360-documentos` (privado, "Block all public access" activado).
4. **Rol IAM** `comercial360-ec2-rol` para EC2, con una política que solo permita ese bucket:

   ```json
   {
     "Version": "2012-10-17",
     "Statement": [{
       "Effect": "Allow",
       "Action": ["s3:PutObject", "s3:GetObject"],
       "Resource": "arn:aws:s3:::comercial360-documentos/*"
     }]
   }
   ```

   Con el rol no hacen falta llaves de AWS en el `.env`: el SDK las toma del EC2.
5. **EC2** Ubuntu 24.04, `t3.small` (o `t3.micro` en capa gratuita), en la misma VPC que RDS, con el security group del paso 1 y el rol del paso 4. Asígnale una **Elastic IP** para que la dirección no cambie.

## 2. Preparar el servidor (una sola vez)

Conéctate por SSH (`ssh -i llave.pem ubuntu@IP_PUBLICA`) y ejecuta:

```bash
# Node 24, nginx, pm2
curl -fsSL https://deb.nodesource.com/setup_24.x | sudo -E bash -
sudo apt-get install -y nodejs nginx git rsync
sudo npm install -g pm2

# Código
git clone https://github.com/MateoMg06/plataforma-de-gestion-comercial.git ~/comercial360
cd ~/comercial360

# Certificado de RDS (HU-INF-02)
mkdir -p ~/.postgresql
curl -fL -o ~/.postgresql/global-bundle.pem https://truststore.pki.rds.amazonaws.com/global/global-bundle.pem

# nginx
sudo cp deploy/nginx.conf /etc/nginx/sites-available/comercial360
sudo ln -sf /etc/nginx/sites-available/comercial360 /etc/nginx/sites-enabled/comercial360
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl reload nginx
```

Crea `backend/.env` **en el servidor** (nunca en el repositorio) a partir de `backend/.env.example`:

```env
PORT=3000
FRONTEND_URL=http://IP_PUBLICA
BETTER_AUTH_URL=http://IP_PUBLICA
BETTER_AUTH_SECRET=<genera uno con: openssl rand -base64 32>

DB_HOST=<endpoint de RDS>
DB_PORT=5432
DB_USER=<usuario de RDS>
DB_PASSWORD=<contraseña de RDS>
DB_NAME=comercial360
DB_SSL=true
DB_SSL_CA=/home/ubuntu/.postgresql/global-bundle.pem

AWS_REGION=us-east-2
S3_BUCKET=comercial360-documentos
```

Revisa que los nombres coincidan exactamente con los de `backend/.env.example`.

## 3. Desplegar

```bash
cd ~/comercial360
deploy/desplegar.sh            # despliega main
deploy/desplegar.sh develop    # o otra rama, para probar
```

El script hace: `git pull` → `npm ci` + build + pruebas del backend → migraciones en RDS → build del frontend con `VITE_API_URL=/api` → copia a `/var/www/comercial360` → `pm2 startOrReload` → espera a que `/api/health` responda.

La primera vez, para que el backend arranque solo si el EC2 se reinicia:

```bash
pm2 startup     # copia y ejecuta el comando sudo que imprime
pm2 save
```

Si es una base de **demo**, puedes cargar datos con `cd backend && npm run seed`. No en producción.

## 4. Comprobar (criterios de la HU)

- `http://IP_PUBLICA/api/health` responde.
- `http://IP_PUBLICA` abre el login y se puede entrar.
- Recargar una ruta como `/clientes` no da 404 (nginx devuelve `index.html`).
- Subir un documento a una cotización y verlo en el bucket S3.
- `sudo reboot`; al volver, la aplicación sigue funcionando (pm2).

## Problemas comunes

| Síntoma | Causa probable |
|---|---|
| 502 Bad Gateway | El backend no está arriba: `pm2 logs comercial360-api` |
| Login no guarda la sesión | `FRONTEND_URL` / `BETTER_AUTH_URL` no son la URL pública exacta |
| Timeout conectando a la base | Security group de RDS no permite el del EC2, o están en VPC distintas |
| `AccessDenied` al subir documento | El EC2 no tiene el rol IAM o el bucket no coincide con la política |
| 413 al subir archivo | Falta `client_max_body_size` en nginx |

HTTPS (dominio + certificado con Let's Encrypt) queda como mejora; no lo pide la historia.
