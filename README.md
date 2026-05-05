# DeepTutor - Guía de Proyecto

Este documento detalla los pasos seguidos para la configuración de la infraestructura y servicios del proyecto DeepTutor.

## Índice

1. [Configuración de PostgreSQL](#1-configuración-de-postgresql)
2. [Seguridad de la API](#2-seguridad-de-la-api)
3. [Endpoints de la API](#3-endpoints-de-la-api)
4. [Ejemplos de Uso (CURL)](#4-ejemplos-de-uso-curl)
5. [Creación de la API de Texto a Voz (Piper TTS)](#5-creación-de-la-api-de-texto-a-voz-piper-tts)
    - [Catálogo de Voces Disponibles](#catálogo-de-voces-disponibles)
    - [Requisitos e Instalación](#requisitos-e-instalación)
    - [Endpoints](#endpoints)
    - [Gestión del Servidor (Producción)](#gestión-del-servidor)
    - [Solución de problemas](#solución-de-problemas)

---

## 1. Configuración de PostgreSQL
- **Host:** `68.221.175.191` (o `localhost` internamente)
- **Puerto:** `5432`
- **Usuario:** `postgresql`
- **Contraseña:** `123456`
- **Base de Datos:** `app_db`

## 2. Seguridad de la API
La API requiere una clave secreta en la cabecera de cada petición (excepto `/health`).

- **Cabecera (Header):** `X-API-Key`
- **Código Secreto:** `<API_KEY>` (Contactar con el administrador)

## 3. Endpoints de la API
La API escucha en el puerto **5001**. Todos los endpoints aceptan `GET`, `POST`, `PUT` (actualizar por ID) y `DELETE` (eliminar por ID).

| Endpoint | Descripción |
| :--- | :--- |
| `/usuarios` | Gestión de usuarios |
| `/topics` | Temas de estudio |
| `/progreso_usuario` | Seguimiento de progreso |
| `/ejercicios` | Ejercicios prácticos |
| `/casos_prueba` | Casos de prueba para ejercicios |
| `/conversaciones` | Sesiones de chat |
| `/chat` | Mensajes individuales |
| `/errores_detectados` | Catálogo de errores comunes |
| `/reglas_validacion` | Reglas de lógica de validación |
| `/error_regla` | Relación entre errores y reglas |
| `/user_errors` | Contador de errores por usuario |
| `/base_conocimiento` | Artículos de conocimiento |

---

## 4. Ejemplos de Uso (CURL)

### Listar (GET)
```bash
curl -H "X-API-Key: <API_KEY>" http://68.221.175.191:5001/
```

### Crear (POST)
```bash
curl -X POST http://68.221.175.191:5001/usuarios \
     -H "X-API-Key: <API_KEY>" \
     -H "Content-Type: application/json" \
     -d '{"nombre": "Juan Perez", "email": "juan@example.com", "password_hash": "hash123", "nivel": "intermedio"}'
```

### Actualizar (PUT)
Para actualizar, añade el ID al final de la URL y envía solo los campos que quieres cambiar.
```bash
curl -X PUT http://68.221.175.191:5001/usuarios/1 \
     -H "X-API-Key: <API_KEY>" \
     -H "Content-Type: application/json" \
     -d '{"nivel": "experto"}'
```

### Eliminar (DELETE)
Añade el ID al final de la URL.
```bash
curl -X DELETE http://68.221.175.191:5001/usuarios/1 \
     -H "X-API-Key: <API_KEY>"
```

---
**Nota:** Si la conexión falla desde fuera (DBeaver o API), asegúrate de haber abierto los puertos **5432** y **5001** en el panel de Azure (Network Security Group).

## 5. Creación de la API de Texto a Voz (Piper TTS)

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
