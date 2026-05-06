# Configuración de Google Cloud Console

Para que el inicio de sesión funcione, debes configurar tus credenciales en la consola de Google.

## Pasos:

1.  **Crear un Proyecto**:
    *   Ve a [Google Cloud Console](https://console.cloud.google.com/).
    *   Crea un nuevo proyecto o selecciona uno existente.

2.  **Configurar la Pantalla de Consentimiento OAuth**:
    *   Ve a **API y servicios** > **Pantalla de consentimiento de OAuth**.
    *   Selecciona "External" (Externo).
    *   Completa la información básica (nombre de la aplicación, correo de soporte, etc.).
    *   En "Scopes" (Permisos), añade `.../auth/userinfo.email` y `.../auth/userinfo.profile`.

3.  **Crear Credenciales**:
    *   Ve a **API y servicios** > **Credenciales**.
    *   Haz clic en **Crear credenciales** > **ID de cliente de OAuth**.
    *   Selecciona **Aplicación web**.
    *   **Orígenes de JavaScript autorizados**:
        *   `http://localhost:5002` (Nuevo puerto unificado)
        *   `http://localhost:5173` (Si sigues usando Vite Dev Server)
    *   **URI de redireccionamiento autorizados**:
        *   `http://localhost:5002`
        *   `http://localhost:5173`
    *   Haz clic en **Crear** y copia el **ID de cliente**.

4.  **Configurar Variables de Entorno**:
    *   **En el Frontend (`/client`)**: Crea un archivo `.env` o modifica `src/main.jsx` con tu `GOOGLE_CLIENT_ID`.
        ```
        VITE_GOOGLE_CLIENT_ID=TU_ID_DE_CLIENTE_AQUÍ
        ```
    *   **En el Backend (`/server`)**: Modifica el archivo `.env`.
        ```
        GOOGLE_CLIENT_ID=TU_ID_DE_CLIENTE_AQUÍ
        ```

## Ejecución local:

1.  **Instalación inicial**:
    ```bash
    npm run install:all
    ```

2.  **Modo Desarrollo (Frontend y Backend por separado)**:
    *   Backend: `npm run server:dev` (Puerto 5002)
    *   Frontend: `npm run client` (Puerto 5173, proxied a 5002)

3.  **Modo Unificado (Producción)**:
    *   Construir el cliente: `npm run build:client`
    *   Iniciar el servidor: `npm run server`
    *   Accede a la app en: `http://localhost:5002`
