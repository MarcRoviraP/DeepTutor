# Documentación de la API (Postgres over Flask)

Esta documentación detalla los endpoints disponibles en la API Flask para interactuar con la base de datos PostgreSQL.

## Configuración de Acceso

- **Base URL:** `http://68.221.175.191:5001`
- **Seguridad:** Requiere la cabecera `X-API-Key`.
- **API Key:** `806bfc1ea9173997e05e9d23263556b3`

---

## Estructura General de Endpoints

Para cada una de las tablas listadas abajo, existen los siguientes métodos:

| Método | Ruta | Descripción |
| :--- | :--- | :--- |
| **GET** | `/{tabla}` | Lista todos los registros. Soporta filtrado por query params. |
| **GET** | `/{tabla}/<id>` | Obtiene un único registro por su ID numérico. |
| **POST** | `/{tabla}` | Crea un nuevo registro. Requiere JSON en el cuerpo. |
| **PUT** | `/{tabla}/<id>` | Actualiza un registro existente por ID. |
| **DELETE** | `/{tabla}/<id>` | Elimina un registro por ID. |

### Filtrado Dinámico (GET)
En las peticiones `GET` a las listas, puedes filtrar usando el formato `columna=eq.valor`.
**Ejemplo:** `GET /usuarios?google_id=eq.12345`

---

## Tablas Disponibles

| Tabla | Columnas Editables (POST/PUT) |
| :--- | :--- |
| `usuarios` | `nombre`, `email`, `password_hash`, `nivel`, `picture`, `google_id` |
| `topics` | `nombre`, `descripcion`, `parent_id` |
| `progreso_usuario` | `usuario_id`, `topic_id`, `nivel`, `score` |
| `ejercicios` | `titulo`, `descripcion`, `dificultad`, `topic_id` |
| `casos_prueba` | `ejercicio_id`, `input`, `output_esperado` |
| `conversaciones` | `usuario_id` |
| `chat` | `usuario_id`, `conversacion_id`, `mensaje`, `respuesta` |
| `errores_detectados` | `nombre`, `tipo`, `descripcion` |
| `reglas_validacion` | `nombre`, `condicion`, `accion`, `activa` |
| `user_errors` | `usuario_id`, `error_id`, `contador` |
| `base_conocimiento` | `topic_id`, `contenido`, `nivel` |

---

## Caso Especial: `error_regla` (Tabla Intermedia)

Esta tabla no sigue el patrón CRUD estándar de ID único.

- **GET** `/error_regla`: Lista todas las relaciones.
- **POST** `/error_regla`: Crea una relación. Cuerpo JSON: `{"error_id": 1, "regla_id": 1}`.
- **DELETE** `/error_regla`: Elimina una relación específica. Requiere query params: `?error_id=1&regla_id=1`.

---

## Ejemplos de Uso (CURL)

### 1. Obtener un usuario por su Google ID
```bash
curl -H "X-API-Key: 806bfc1ea9173997e05e9d23263556b3" \
     "http://68.221.175.191:5001/usuarios?google_id=eq.113415650463101186262"
```

### 2. Crear un nuevo tema (Topic)
```bash
curl -X POST http://68.221.175.191:5001/topics \
     -H "X-API-Key: 806bfc1ea9173997e05e9d23263556b3" \
     -H "Content-Type: application/json" \
     -d '{"nombre": "Python Avanzado", "descripcion": "Decoradores y Generadores"}'
```

### 3. Actualizar nivel de un usuario
```bash
curl -X PUT http://68.221.175.191:5001/usuarios/25 \
     -H "X-API-Key: 806bfc1ea9173997e05e9d23263556b3" \
     -H "Content-Type: application/json" \
     -d '{"nivel": "experto"}'
```
