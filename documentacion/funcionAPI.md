# API de Texto a Voz (Piper TTS)

Esta es una API sencilla construida con Flask que utiliza [Piper](https://github.com/rhasspy/piper) para convertir texto en audio (WAV).

## Endpoints

### 1. Generar Audio (TTS)
Convierte un texto en un archivo de audio WAV.

- **URL:** `/tts`
- **Método:** `POST`
- **Cuerpo (JSON):**
  ```json
  {
    "text": "Hola, ¿cómo estás?"
  }
  ```
- **Respuesta:** Archivo de audio con mimetype `audio/wav`.

#### Ejemplo con `curl`:
```bash
curl -X POST http://68.221.175.191:5000/tts \
     -H "Content-Type: application/json" \
     -d '{"text":"Hola, esto es una prueba de voz"}' \
     --output voz.wav
```

### 2. Estado de Salud (Health Check)
Verifica si la API está funcionando correctamente.

- **URL:** `/health`
- **Método:** `GET`
- **Respuesta:**
  ```json
  {
    "status": "ok"
  }
  ```

---

## Ejecución en el servidor

Para ejecutar la API en segundo plano, asegúrate de usar el entorno virtual:

```bash
nohup ./.venv/bin/python3 src/app.py > app.log 2>&1 &
```

## Solución de problemas (Acceso Externo)

Si no puedes acceder desde fuera del servidor (Timeout), asegúrate de:
1. Abrir el puerto **5000** (TCP) en el firewall de tu proveedor de nube (Azure NSG, AWS Security Group, etc.).
2. Permitir el tráfico **ICMP** si deseas que el servidor responda a `ping`.
