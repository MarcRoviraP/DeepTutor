# DeepTutor - Guía de Proyecto

Este documento detalla los pasos seguidos para la configuración de la infraestructura y servicios del proyecto DeepTutor.

## Índice

1. [Configuración del Servidor SQL (PostgreSQL)](#1-configuración-del-servidor-sql-postgresql)
2. [Herramientas de Gestión de Datos](#2-herramientas-de-gestión-de-datos)
3. [Acceso Remoto para Colaboradores](#3-acceso-remoto-para-colaboradores)
4. [Creación de la API de Texto a Voz (Piper TTS)](#4-creación-de-la-api-de-texto-a-voz-piper-tts)
    - [Catálogo de Voces Disponibles](#catálogo-de-voces-disponibles)
    - [Requisitos e Instalación](#requisitos-e-instalación)
    - [Endpoints](#endpoints)
    - [Gestión del Servidor (Producción)](#gestión-del-servidor)
    - [Solución de problemas](#solución-de-problemas)

---

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

## 2. Herramientas de Gestión de Datos

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
- **Host (IP)**: `10.0.213.131`
- **Puerto**: `5432`
- **Database**: `marc`
- **Username**: `marc`
- **Password**: `12344321`

---

## 4. Creación de la API de Texto a Voz (Piper TTS)

Esta es una API sencilla construida con Flask que utiliza [Piper](https://github.com/rhasspy/piper) para convertir texto en audio (WAV).

### Catálogo de Voces Disponibles

Se han instalado varios modelos de alta calidad en la carpeta `models/`. Puedes intercambiarlos editando la variable `MODEL_PATH` en `src/app.py`.

| Nombre | Calidad | Género | Región | Descripción |
| :--- | :--- | :--- | :--- | :--- |
| **Davefx** | Medium | Masc. | España | **Excelente entrenamiento**, voz muy natural. |
| **Cortana** | **High** | Fem. | México | Voz premium, muy clara y profesional. |
| **Laura** | **High** | Fem. | México | Voz premium, tono de asistente moderno. |
| **Daniela** | **High** | Fem. | Argentina | Alta fidelidad con acento argentino. |
| **Sharvard** | Medium | Mixto | España | Multi-voz (Speaker 0: Masc, Speaker 1: Fem). |
| **Carlfm** | X-Low | Masc. | España | Muy rápida, pero de menor calidad. |

### Requisitos e Instalación

1. **Entorno virtual:**
   ```bash
   python3 -m venv .venv
   source .venv/bin/activate
   pip install flask flask-cors gunicorn
   ```

2. **Binarios:** El ejecutable `piper` y las librerías `.so` deben estar en la raíz del proyecto.

### Endpoints

#### 1. Generar Audio (TTS)
- **URL:** `/tts`
- **Método:** `POST`
- **JSON:** `{"text": "Tu mensaje aquí"}`
- **Respuesta:** Audio `wav`.

#### 2. Estado de Salud
- **URL:** `/health`
- **Método:** `GET`

---

### Gestión del Servidor

#### Script de Control (`start.sh`)
Se ha creado un script para facilitar el reinicio en modo producción:
```bash
./start.sh
```
Este script mata procesos anteriores en el puerto 5000 e inicia `gunicorn` con un timeout de 10 minutos (necesario para textos largos).

#### Servicio del Sistema (`systemd`)
Para que la API arranque automáticamente con el sistema operativo:

*   **Archivo de servicio:** `/etc/systemd/system/piper-tts.service`
*   **Comandos de gestión:**
    ```bash
    sudo systemctl status piper-tts   # Ver estado
    sudo systemctl restart piper-tts  # Reiniciar
    sudo systemctl stop piper-tts     # Detener
    journalctl -u piper-tts -f        # Ver logs en tiempo real
    ```

### Solución de problemas

1. **Timeout**: Los textos muy largos pueden tardar varios minutos en procesarse. El sistema está configurado para esperar hasta 10 minutos.
2. **CORS**: Habilitado para permitir peticiones desde cualquier origen web.
3. **Logs**: Revisa `server.log` o `journalctl` para depurar errores internos.
