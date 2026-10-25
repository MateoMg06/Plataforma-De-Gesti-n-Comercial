# Jenkins en la EC2 (HU-INF-05)

Pipeline **pull → build → test → deploy** corriendo en la misma EC2 que la
aplicación. El `Jenkinsfile` de la raíz orquesta `deploy/desplegar.sh`
(HU-INF-03) y se ejecuta solo cuando cambia `main`.

```
GitHub (main) ──poll 5 min──▶ Jenkins (misma EC2) ──etapas──▶ build + test
                                                    └──deploy──▶ desplegar.sh
                                                                   ├── git pull
                                                                   ├── migraciones (RDS)
                                                                   ├── frontend → /var/www
                                                                   └── pm2 + /api/health
```

**Requisito:** tener aplicada la HU-INF-03 (EC2 con nginx, pm2 y el repo en
`~/comercial360`). Ver [despliegue-aws.md](despliegue-aws.md).

---

## 1. Instalar Jenkins (una sola vez, por SSH)

```bash
# Java (Jenkins lo necesita)
sudo apt-get update
sudo apt-get install -y openjdk-21-jre-headless

# Repositorio oficial de Jenkins (Debian/Ubuntu)
sudo wget -O /usr/share/keyrings/jenkins-keyring.asc \
  https://pkg.jenkins.io/debian-stable/jenkins.io-2023.key
echo "deb [signed-by=/usr/share/keyrings/jenkins-keyring.asc] https://pkg.jenkins.io/debian-stable binary/" | \
  sudo tee /etc/apt/sources.list.d/jenkins.list > /dev/null
sudo apt-get update
sudo apt-get install -y jenkins
sudo systemctl enable --now jenkins
```

2. **Security group de la EC2** (consola AWS): agrega entrada **8080 (TCP)
   solo desde tu IP** (`/32`). Nunca `0.0.0.0/0`: Jenkins tiene pantalla de
   administración.

3. Abre `http://IP_PUBLICA:8080` y saca la contraseña inicial:

   ```bash
   sudo cat /var/lib/jenkins/secrets/initialAdminPassword
   ```

4. Sigue el asistente: **Install suggested plugins** (instala Git y Pipeline,
   que son los que usamos) y crea el usuario administrador.

## 2. Darle permiso a Jenkins para desplegar

Jenkins corre con el usuario `jenkins`, pero la aplicación (pm2, `/var/www`)
es de `ubuntu`. En vez de darle todo el sudo, se permite **un solo comando**:

```bash
echo 'jenkins ALL=(ubuntu) NOPASSWD: /home/ubuntu/comercial360/deploy/desplegar.sh' | \
  sudo tee /etc/sudoers.d/jenkins-deploy > /dev/null
sudo chmod 440 /etc/sudoers.d/jenkins-deploy
sudo visudo -cf /etc/sudoers.d/jenkins-deploy   # debe decir: parsed OK
```

## 3. Crear el job (una sola vez)

> **Orden importante:** el `Jenkinsfile` debe estar en `main`, así que primero
> mergea esta rama (HU-INF-05) y luego crea el job.

1. Jenkins → **New Item** → nombre `comercial360-despliegue` → **Pipeline**.
2. *Pipeline* → *Definition*: **Pipeline script from SCM** → *SCM*: **Git** →
   URL del repositorio → *Branches to build*: `main` → *Script Path*: `Jenkinsfile`.
   (Si el repo es privado, agrega primero una credencial *Username with password*
   o SSH key en *Credentials*.)
3. Guarda. El trigger `pollSCM` ya viene dentro del `Jenkinsfile`.
4. Dale **Build Now**: deben pasar las 4 etapas (Pull, Build, Test, Deploy) en
   verde. Al terminar, `http://IP_PUBLICA/api/health` debe responder.

Si Jenkins no arranca: `sudo systemctl status jenkins` y
`sudo journalctl -u jenkins -n 50 --no-pager`.

## 4. Demostración: un cambio desplegado (criterio de la HU)

1. Haz un cambio visible en una rama (ejemplo: un texto en el README o en el
   frontend), commitea con `HU-INF-05: ...` y abre un PR a `main`.
2. Mergea el PR.
3. En ≤5 minutos Jenkins lo detecta (pollSCM) y corre el pipeline solo.
4. Verifica:
   - El job quedó **verde** con las 4 etapas (captura de pantalla).
   - `http://IP_PUBLICA/api/health` responde.
   - `http://IP_PUBLICA` muestra el cambio que hiciste.
5. Guarda la captura del pipeline verde para la sustentación.

También se puede lanzar a mano con **Build Now** (útil para la primera vez).

## 5. Problemas comunes

| Síntoma | Causa probable |
|---|---|
| `sudo: a password is required` en Deploy | Falta o está mal la línea de sudoers (`sudo visudo -cf /etc/sudoers.d/jenkins-deploy`) |
| `npm: command not found` | Node 24 no está instalado en la EC2 (ver HU-INF-03) o Jenkins arrancó con otra PATH; reconecta por SSH y prueba `sudo -u jenkins npm -v` |
| `Cannot find module` o build raro en el workspace | Build fallida previa: usa **Wipe Out Current Workspace** y vuelve a lanzar |
| La build pasa pero la app no cambia | El deploy apunta a `~/comercial360` (clon de `ubuntu`); revisa `pm2 logs comercial360-api` |
| pm2 no reinicia | Dos demonios de pm2 (uno de `ubuntu` y otro de `jenkins`): el deploy debe correr **como ubuntu**; revisa la línea de sudoers |
| Jenkins no ve el `Jenkinsfile` | El job apunta a otra rama o la HU-INF-05 no está mergeada en `main` |
| `pollSCM` no dispara nada | Espera 5 min y revisa *Polling Log* del job; verifica que el job apunte a `main` |
| Jenkins muy lento en `t3.small` | Normal con build + app juntos; si es `t3.micro` no alcanza la memoria, usa `t3.small` (HU-INF-03) |

## Ideas para después (no pide la historia)

- Webhook de GitHub para disparar al instante en vez de poll de 5 min.
- Notificaciones al equipo cuando falla el deploy.
- Etapa de SonarQube (HU-INF-06) dentro del mismo pipeline.
