# Comercial 360 · Plataforma de Gestión Comercial

Backend en NestJS + frontend en React, con Clean Architecture, PostgreSQL (RDS), S3, EC2 y Jenkins.

## Requisitos

- Node.js 24 LTS
- Docker (solo para la base de datos local)

## Correr el proyecto en tu máquina

```bash
# 1. Base de datos local
docker compose up -d

# 2. Backend (http://localhost:3000/api)
cd backend
cp .env.example .env
npm install
npm run migration:run
npm run seed          # datos de prueba (ver abajo)
npm run start:dev

# 3. Frontend (http://localhost:5173), en otra terminal
cd frontend
cp .env.example .env
npm install
npm run dev
```

### Entrar a la aplicación

Después de `npm run seed`, abre http://localhost:5173 y entra como administrador:

| Correo | Contraseña |
|---|---|
| `admin@comercial360.co` | `Demo2026!` |

Los demás usuarios de prueba están en [Datos de prueba](#datos-de-prueba-seed). Si dice "Correo o contraseña incorrectos", lee la nota sobre usuarios que ya existían en esa misma sección.

Para comprobar que todo funciona: abre http://localhost:3000/api/health y luego, en el frontend, **Configuración → Ver ejemplo: catálogo de zonas**. Si puedes agregar una zona, la cadena frontend → backend → PostgreSQL está bien.

## PostgreSQL en AWS RDS (HU-INF-02)

La configuración está preparada para PostgreSQL local y RDS. La instancia AWS
se crea por separado; estos cambios no crean recursos ni trasladan los datos locales.
Región de referencia: **us-east-2 (Ohio)**, la misma indicada en
`AWS_REGION` de `backend/.env.example` para los servicios AWS del proyecto.

### Crear la instancia

1. En la región acordada, abrir RDS y crear una instancia **PostgreSQL**. Usar
   PostgreSQL 16 para mantener la misma versión mayor que Docker local.
2. Definir el identificador de la instancia y, en la configuración adicional,
   el **nombre inicial de base de datos `comercial360`**. El identificador de la
   instancia y el nombre de la base son valores distintos.
3. Guardar el usuario administrador y su contraseña fuera del repositorio.
   Revisar el costo estimado, el tamaño y el almacenamiento antes de crearla;
   no asumir que la cuenta dispone de recursos gratuitos.
4. Para el despliegue con EC2, usar la misma VPC y una base sin acceso público.
   En el grupo de seguridad de RDS permitir TCP 5432 desde el grupo de seguridad
   del backend. Ejecutar las migraciones desde una máquina con acceso a esa red.
   Si se hace una prueba temporal desde el equipo local mediante acceso público,
   permitir únicamente la IP pública del desarrollador (`/32`), nunca `0.0.0.0/0`,
   y retirar ese acceso al terminar.
5. Esperar el estado **Available** y copiar el endpoint DNS y el puerto de la
   pestaña de conectividad. No usar una IP fija ni anteponer `https://` al endpoint.

Referencia: [crear y conectar PostgreSQL en RDS](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/CHAP_GettingStarted.CreatingConnecting.PostgreSQL.html).

### Configurar el backend

El archivo `global-bundle.pem` contiene los certificados de las autoridades de
confianza de AWS RDS. Permite comprobar que el certificado presentado por el
servidor pertenece al endpoint al que se está conectando el backend. Con
`DB_SSL=true`, la conexión va cifrada y se verifica la identidad del servidor.
El archivo no es una contraseña ni contiene datos de la aplicación.

Descargar el [bundle CA oficial de RDS](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/UsingWithRDS.SSL.html)
y guardarlo fuera del repositorio. En Linux o macOS:

```bash
mkdir -p "$HOME/.postgresql"
curl -fL https://truststore.pki.rds.amazonaws.com/global/global-bundle.pem \
  -o "$HOME/.postgresql/global-bundle.pem"
realpath "$HOME/.postgresql/global-bundle.pem"
```

Copiar la ruta absoluta que devuelve el último comando en `DB_SSL_CA` del
`backend/.env`. No escribir `$HOME` ni `~` en esa variable: el backend usa la ruta
literal. Dejar una sola línea `DB_SSL_CA`, sin otra definición vacía que la
sobrescriba. El proceso del backend debe tener permiso de lectura sobre el archivo.

En otro PC hay que descargar el certificado y configurar la ruta propia de ese
equipo. Git no incluye el `.env` ni los archivos `.pem`. En Windows, descargar el
archivo desde el mismo enlace y usar una ruta como
`DB_SSL_CA=C:/Users/tu_usuario/.postgresql/global-bundle.pem`.

En el entorno del backend que conectará a RDS, establecer estos valores:

```dotenv
DB_HOST=<endpoint-DNS-de-RDS>
DB_PORT=5432
DB_USER=<usuario-de-la-base>
DB_PASSWORD=<contraseña-privada>
DB_NAME=comercial360
DB_SSL=true
DB_SSL_CA=/ruta/absoluta/al/global-bundle.pem
```

Son ejemplos de configuración: reemplazar los valores entre `< >`. No sobrescribir
el `.env` local que funciona; usar estas variables en el entorno de despliegue.
`DB_SSL=true` exige un certificado CA legible y valida la identidad del servidor.
No desactivar la validación del certificado para resolver errores de conexión.

### Aplicar y verificar las migraciones

Desde `backend/`, con las variables anteriores cargadas y acceso de red a RDS:

```bash
npm run build
npm run typeorm -- query 'SELECT current_database() AS base, ssl FROM pg_stat_ssl WHERE pid = pg_backend_pid()'
npm run typeorm -- migration:show
npm run migration:run
npm run typeorm -- migration:show
```

La consulta debe mostrar `base = comercial360` y `ssl = true`. Al finalizar,
las migraciones deben figurar aplicadas (`[X]`). Se mantiene `synchronize: false`:
las tablas se crean mediante las migraciones versionadas.

RDS comienza sin los datos de tu base local. Para una instancia exclusivamente
de **demo**, se puede ejecutar `npm run seed`; no ejecutar ese script en producción.
Luego reiniciar el backend y comprobar el login y el listado de clientes.

La HU queda validada en AWS cuando existe la instancia, la conexión verifica el
certificado, las migraciones están aplicadas y el backend puede consultar datos.
Preparar el código por sí solo no acredita esas comprobaciones.

## Despliegue en EC2 (HU-INF-03)

Guía paso a paso en [docs/despliegue-aws.md](docs/despliegue-aws.md): EC2 con nginx y pm2, RDS y S3 con rol IAM. Archivos en `deploy/`.

## Datos de prueba (seed)

`npm run seed` (en `backend/`) carga datos para la demo:

- 6 usuarios con rol.
- Catálogos: zonas, tipos, potenciales y estados.
- 4 asesores, uno de ellos inactivo.
- 10 clientes con coordenadas reales y su contacto principal.
- 2 rutas.
- 10 visitas con fechas **relativas a hoy**, para que la agenda siempre tenga visitas.
- Seguimientos, 3 cotizaciones y un pedido.

Se puede correr varias veces: lo que ya existe no se vuelve a crear.

Todos los usuarios tienen la contraseña de prueba **`Demo2026!`**. Es solo para desarrollo y demo; nunca la uses en producción.

| Usuario | Rol | Qué ve |
|---|---|---|
| `admin@comercial360.co` | administrador | Todo, incluida Configuración |
| `lider@comercial360.co` | lider | Todo menos Configuración |
| `laura@comercial360.co` | asesor | Solo sus 4 visitas, sus clientes y su ruta activa |
| `carlos@comercial360.co` | asesor | Solo sus visitas y clientes |
| `sofia@comercial360.co` | asesor | Nada: es un asesor sin visitas |
| `juan@comercial360.co` | asesor | "Mi agenda" le avisa que no tiene asesor vinculado |

Si el usuario ya existía en tu base, el seed solo le asigna el rol y **conserva su contraseña**: no es `Demo2026!` sino la que tenía. Por ejemplo, si creaste `admin@comercial360.co` a mano antes del seed, entra con esa contraseña o empieza de cero (abajo).

En AWS (RDS), después de correr el seed para la demo, cambia la contraseña del administrador: el repositorio es público y cualquiera puede leer `Demo2026!`.

**Empezar de cero** (borra todos los datos locales):

```bash
docker compose down -v
docker compose up -d
cd backend && npm run migration:run && npm run seed
```

## Estructura

```
backend/src/
  config/              configuración de la base de datos (lee .env)
  database/migrations/ migraciones TypeORM versionadas
  shared/              piezas comunes (health check)
  modules/
    zonas/             ← EJEMPLO COMPLETO: cópialo para tu módulo
    auth/ clientes/ asesores/ rutas/ visitas/ seguimiento/ ventas/ dashboard/
                       cada uno con domain / application / infrastructure / presentation
frontend/src/
  api/client.ts        única forma de llamar al backend
  layout/              barra lateral, menú por rol
  pages/               pantallas (ZonasPage es el ejemplo)
  styles/theme.css     colores de los diseños
docs/modelo-datos.md   quién es dueño de cada tabla y campos que faltan
```

## Quién hace qué

| Persona | Módulo | Historias |
|---|---|---|
| Kevin V | `auth` + repositorio | HU-01 a HU-04, HU-INF-01 |
| Francisco | `clientes`, `zonas` + RDS | HU-05 a HU-09, HU-INF-02 |
| Mateo | `asesores` (asesores y agenda) + EC2 | HU-10 a HU-13, HU-INF-03 |
| Andres | `rutas` | HU-14 a HU-17 |
| Santiago | `visitas` | HU-18 a HU-22 |
| Kevin B | `seguimiento` | HU-23 a HU-26 |
| Daniel | `ventas` + S3 | HU-27 a HU-31, HU-INF-04 |
| Julian | `dashboard` + Jenkins | HU-32 a HU-35, HU-INF-05 |

Antes de tu primer PR lee [CONTRIBUTING.md](CONTRIBUTING.md).

## Comandos útiles (backend)

| Comando | Qué hace |
|---|---|
| `npm run start:dev` | Levanta la API con recarga automática |
| `npm test` | Pruebas unitarias |
| `npm run migration:generate -- src/database/migrations/Nombre` | Crea una migración a partir de tus entidades |
| `npm run migration:run` | Aplica las migraciones pendientes |
| `npm run seed` | Carga los datos de prueba (se puede correr varias veces) |
