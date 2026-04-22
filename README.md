# DeepTutor

Este proyecto utiliza **PostgreSQL** como motor de base de datos. A continuación, se detallan los procesos realizados para la configuración del entorno de desarrollo y la habilitación del acceso colaborativo.

## 1. Configuración del Servidor SQL (PostgreSQL)

Se ha instalado y configurado un servidor PostgreSQL en un entorno Linux (Arch/CachyOS).

### Instalación e Inicialización
1. **Instalación**: Se utilizó el gestor de paquetes `pacman` para instalar `postgresql`.
2. **Inicialización**: Se creó el cluster de datos en `/var/lib/postgres/data`.
3. **Servicio**: El servidor se configuró para iniciar automáticamente con el sistema:
   ```bash
   sudo systemctl enable --now postgresql
   ```

### Configuración de Usuario y Base de Datos
Se creó un rol de superusuario y una base de datos propia para evitar el uso constante del usuario `postgres`:
- **Usuario**: `marc` (Superusuario)
- **Base de Datos**: `marc`
- **Contraseña**: `12344321` (Configurada para permitir conexiones remotas)

## 2. Herramientas de Gestión
Para la administración visual de los datos, se instaló **DBeaver Community Edition**:
```bash
sudo pacman -S dbeaver
```

## 3. Acceso Remoto para Colaboradores
Se habilitó la conexión para que otros miembros del equipo puedan conectarse al servidor local.

### Cambios en la Configuración
- **Escucha Global**: En `postgresql.conf`, se cambió `listen_addresses` a `'*'` para aceptar conexiones fuera de localhost.
- **Permisos de Red**: En `pg_hba.conf`, se autorizó el rango de red local:
  - Regla: `host all all 10.0.213.0/24 scram-sha-256`
- **Firewall**: Se abrió el puerto TCP `5432`.

### Datos de Conexión para el Equipo
Para conectar desde un cliente externo (como DBeaver), utilizar:
- **Host (IP)**: `10.0.213.131`
- **Puerto**: `5432`
- **Database**: `marc`
- **Username**: `marc`
- **Password**: `12344321`

---
*Nota: La seguridad se basa en la red local. Si se requiere acceso desde fuera de la red, se deberá configurar una VPN o un túnel SSH.*
