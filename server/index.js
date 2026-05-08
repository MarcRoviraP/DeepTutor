const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const path = require('path');
const db = require('./db');
require('dotenv').config();

const app = express();
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

app.use(cors());
app.use(express.json());
app.use((req, res, next) => {
  console.log(`[SERVER] ${req.method} ${req.url}`);
  next();
});

app.post('/api/auth/google', async (req, res) => {
  const { credential } = req.body;
  console.log('--- Intento de Autenticación con Google ---');
  console.log('Cuerpo de la petición:', JSON.stringify(req.body));
  console.log('Credencial recibida (primeros 10 caracteres):', credential ? credential.substring(0, 10) + '...' : 'NINGUNA');
  console.log('ID de Cliente objetivo (Servidor):', process.env.GOOGLE_CLIENT_ID);

  try {
    // 1. Verify the Google JWT
    console.log('Paso 1: Verificando Token de ID de Google...');
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { sub: googleId, email, name, picture } = payload;
    console.log('✅ Token verificado con éxito para:', email);

    // 2. Check if user exists in DB via API
    console.log('Paso 2: Buscando usuario en la API de DB externa...');
    const users = await db.findUserByGoogleIdOrEmail(googleId, email);

    let user;

    if (users.length === 0) {
      console.log('Paso 3: Nuevo usuario detectado. Creando registro vía API...');
      // 3. Create new user if doesn't exist
      user = await db.createUser({
        google_id: googleId,
        email: email,
        nombre: name,
        picture: picture,
        nivel: 'principiante' // default level
      });
      console.log('✅ Nuevo usuario creado con éxito.');
    } else {
      user = users[0];
      console.log('✅ Usuario existente encontrado. ID:', user.id);
    }

    // 4. Generate app-specific JWT
    console.log('Paso 4: Generando JWT de la aplicación...');
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET || 'your_super_secret_key',
      { expiresIn: '7d' }
    );

    // 5. Send response
    console.log('🚀 ¡Login exitoso! Enviando credenciales al frontend.');
    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.nombre, // We map 'nombre' back to 'name' for the frontend
        picture: user.picture,
      },
    });
  } catch (error) {
    console.error('❌ FALLÓ el proceso de verificación de Google.');
    console.error('Tipo de Error:', error.name);
    console.error('Mensaje de Error:', error.message);
    
    if (error.message.includes('audience')) {
      console.error('CRÍTICO: Discrepancia de audiencia. Verificá si el frontend y el backend usan EXACTAMENTE el mismo Client ID.');
    }
    
    res.status(401).json({ 
      error: 'Token de Google inválido', 
      details: error.message 
    });
  }
  console.log('--- Proceso de Autenticación Finalizado ---');
});

app.get('/api/exercises', async (req, res) => {
  console.log('[SERVER] Petición GET /api/exercises recibida');
  try {
    const exercises = await db.request('/ejercicios');
    console.log(`[SERVER] Se obtuvieron con éxito ${exercises ? exercises.length : 0} ejercicios de la API de DB`);
    res.json(exercises);
  } catch (error) {
    console.error('[SERVER] Error al obtener ejercicios:', error.message);
    res.status(500).json({ error: 'Error al obtener ejercicios', details: error.message });
  }
});

app.get('/api/exercises/:id', async (req, res) => {
  const { id } = req.params;
  try {
    // Try different common patterns for REST APIs
    let exercise;
    try {
      // 1. Standard /table/id
      exercise = await db.request(`/ejercicios/${id}`);
    } catch (e) {
      console.log(`[SERVER] El patrón /ejercicios/${id} falló, probando filtro...`);
      // 2. Filter pattern (common in PostgREST and others)
      const results = await db.request(`/ejercicios?id=eq.${id}`);
      if (Array.isArray(results) && results.length > 0) {
        exercise = results[0];
      } else {
        // 3. Simple query param
        const results2 = await db.request(`/ejercicios?id=${id}`);
        if (Array.isArray(results2) && results2.length > 0) {
          exercise = results2[0];
        } else {
          throw new Error('Ejercicio no encontrado');
        }
      }
    }
    res.json(exercise);
  } catch (error) {
    console.error('[SERVER] Error al obtener ejercicio:', error.message);
    res.status(500).json({ error: 'Error al obtener detalles del ejercicio', details: error.message });
  }
});

app.get('/api/topics', async (req, res) => {
  try {
    const topics = await db.request('/topics');
    res.json(topics);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener temas' });
  }
});

app.get('/api/users', async (req, res) => {
  try {
    const users = await db.request('/usuarios');
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener usuarios' });
  }
});

// --- Unified Frontend Serving ---
// Serve static files from the React app build (Login)
app.use(express.static(path.join(__dirname, '../client/dist')));

// Serve the main application (deep-tutor-web) at /dashboard
app.use('/dashboard', express.static(path.join(__dirname, '../deep-tutor-web')));

// Serve the Avatar app (root directory) at /avatar
app.use('/avatar', express.static(path.join(__dirname, '../')));

// The "catchall" handler: for any request that doesn't
// match one above, send back React's index.html file.
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
