# Documentación de la API y Base de Datos

Este documento detalla la configuración de PostgreSQL y los endpoints de la API Flask con seguridad habilitada.

## 1. Configuración de PostgreSQL
- **Host:** `<DB_HOST>` (o `localhost` internamente)
- **Puerto:** `<DB_PORT>`
- **Usuario:** `<DB_USER>`
- **Contraseña:** `<DB_PASSWORD>`
- **Base de Datos:** `<DB_NAME>`

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
| `/user_ejer` | Envíos de ejercicios por usuario |
| `/casos_prueba` | Casos de prueba para ejercicios |
| `/conversaciones` | Sesiones de chat |
| `/chat` | Mensajes individuales |
| `/errores_detectados` | Catálogo de errores comunes |
| `/reglas_validacion` | Reglas de lógica de validación |
| `/error_regla` | Relación entre errores y reglas |
| `/user_errors` | Contador de errores por usuario |
| `/base_conocimiento` | Artículos de conocimiento |
| `/documents` | Archivos fuente para RAG |
| `/knowledge_chunks` | Fragmentos vectorizados para búsqueda |
| `/execute` | Ejecución segura de código (Python, Lua, Java) |

---

## 4. Sistema RAG y Búsqueda Semántica
Se ha implementado un sistema de **Retrieval-Augmented Generation (RAG)** para permitir búsquedas semánticas sobre documentos PDF.

### Configuración Técnica
- **Motor Vectorial:** Extensión `pgvector` en PostgreSQL.
- **Modelo de Embeddings:** `all-mpnet-base-v2` (768 dimensiones).
- **Métrica de Similitud:** Distancia del Coseno (operador `<=>`).

### Endpoint de Búsqueda Semántica (`/ask`)
Este endpoint recibe una pregunta en lenguaje natural, genera su embedding y busca los fragmentos más relevantes.

- **Método:** `POST`
- **URL:** `/ask`
- **Cuerpo (JSON):**
  ```json
  {
    "question": "¿Cómo se define una función en Python?",
    "limit": 5
  }
  ```

**Ejemplo CURL:**
```bash
curl -X POST http://<SERVER_IP>:5001/ask \
     -H "X-API-Key: <API_KEY>" \
     -H "Content-Type: application/json" \
     -d '{"question": "qué es una lista", "limit": 3}'
```

---

## 5. Ingesta de Documentos
Para alimentar el sistema RAG, se utiliza el script inteligente `srv/ingest_pdf.py`.

**Características de la Ingesta:**
1.  **Ingesta Masiva**: Procesa automáticamente todos los archivos `.pdf` dentro de `srv/rag-data/pdf`.
2.  **Topics Dinámicos**: Extrae la tecnología o lenguaje del nombre del archivo y crea el `topic` en la base de datos si no existe.
3.  **Detección de Nivel**: Identifica el nivel (Principiante, Intermedio, Avanzado) basándose en palabras clave del nombre del archivo.
4.  **Sanitización**: Limpia automáticamente caracteres nulos (`\x00`) que suelen corromper la inserción en PostgreSQL.
5.  **Evita Duplicados**: Comprueba si el archivo ya fue procesado antes de volver a indexarlo.

**Ejecución:**
```bash
# Se recomienda usar el entorno virtual
/home/deepcode/srv/.venv/bin/python srv/ingest_pdf.py
```

---

## 6. Notas Técnicas y Optimizaciones

### Índices Vectoriales
Para el volumen actual de datos (menos de 10.000 fragmentos), se ha optado por **no usar índices IVFFLAT**. 
> [!IMPORTANT]
> El uso de `ivfflat` con pocas filas y muchas listas (ej: 100 listas para 37 filas) provoca que las búsquedas devuelvan resultados vacíos. Para datasets pequeños, el escaneo secuencial es instantáneo y 100% preciso.

### Dependencias RAG
El sistema requiere `pymupdf` (importado como `fitz`) y `sentence-transformers`. No confundir con el paquete `fitz` de PyPI, que es una librería distinta.

---

## 7. Ejemplos de Uso (CURL)

### Listar todos (GET)
```bash
curl -H "X-API-Key: <API_KEY>" http://<SERVER_IP>:5001/usuarios
```
... (resto de ejemplos existentes)

### Buscar por ID (GET)
Añade el ID al final de la URL para obtener un único registro.
```bash
curl -H "X-API-Key: <API_KEY>" http://<SERVER_IP>:5001/usuarios/1
```

### Filtrar por Parámetros (GET)
Puedes filtrar los resultados en las listas usando el formato `columna=eq.valor`.
```bash
curl -H "X-API-Key: <API_KEY>" "http://<SERVER_IP>:5001/usuarios?google_id=eq.113415650463101186262"
```

### Crear (POST)
```bash
curl -X POST http://<SERVER_IP>:5001/usuarios \
     -H "X-API-Key: <API_KEY>" \
     -H "Content-Type: application/json" \
     -d '{"nombre": "Juan Perez", "email": "juan@example.com", "password_hash": "hash123", "nivel": "intermedio"}'
```

### Actualizar (PUT)
Para actualizar, añade el ID al final de la URL y envía solo los campos que quieres cambiar.
```bash
curl -X PUT http://<SERVER_IP>:5001/usuarios/1 \
     -H "X-API-Key: <API_KEY>" \
     -H "Content-Type: application/json" \
     -d '{"nivel": "experto"}'
```

### Eliminar (DELETE)
Añade el ID al final de la URL.
```bash
curl -X DELETE http://<SERVER_IP>:5001/usuarios/1 -H "X-API-Key: <API_KEY>"
```


### Ejecutar Código (`/execute`)
Envía un archivo con el código a ejecutar. Soporta entrada estándar mediante el campo `input`.

- **Método:** `POST`
- **URL:** `/execute`
- **Cuerpo (Multipart Form Data):**
  - `file`: Archivo `.py`, `.lua` o `.java`.
  - `input`: (Opcional) String o lista JSON con las entradas para el script.

**Ejemplo CURL (Lua con entrada):**
```bash
echo 'nombre = io.read(); print("Hola " .. nombre)' > prueba.lua
curl -X POST http://<SERVER_IP>:5001/execute \
     -H "X-API-Key: <API_KEY>" \
     -F "file=@prueba.lua" \
     -F "input=Antigravity"
```

---
**Nota:** Si la conexión falla desde fuera (DBeaver o API), asegúrate de haber abierto los puertos **5432** y **5001** en el panel de Azure (Network Security Group).
