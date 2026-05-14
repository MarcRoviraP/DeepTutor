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
      try {
        // 3. Create new user if doesn't exist
        user = await db.createUser({
          google_id: googleId,
          email: email,
          nombre: name,
          picture: picture,
          nivel: 'principiante' // default level
        });
        console.log('✅ Nuevo usuario creado con éxito.');
      } catch (createError) {
        // Mitigación para el error "0" de Flask
        if (createError.message && createError.message.includes('"error": "0"')) {
          console.log('[SERVER] Detectado error "0" fantasma en creación de usuario. Re-intentando búsqueda...');
          const retryUsers = await db.findUserByGoogleIdOrEmail(googleId, email);
          if (retryUsers.length > 0) {
            user = retryUsers[0];
            console.log('✅ Usuario recuperado tras error fantasma. ID:', user.id);
          } else {
            throw createError; // Si realmente no se creó, lanzamos el error
          }
        } else {
          throw createError;
        }
      }
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

// --- Chat & Conversations ---

app.get('/api/conversations', async (req, res) => {
  const { usuario_id } = req.query;
  if (!usuario_id) return res.status(400).json({ error: 'usuario_id es requerido' });
  try {
    const convs = await db.request(`/conversaciones?usuario_id=eq.${usuario_id}`);
    res.json(convs || []);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener conversaciones' });
  }
});

app.post('/api/conversations', async (req, res) => {
  const { usuario_id } = req.body;
  console.log(`[SERVER] Intentando crear conversación para usuario_id: ${usuario_id}`);
  
  if (!usuario_id) return res.status(400).json({ error: 'usuario_id es requerido' });
  
  try {
    const payload = { 
      usuario_id: parseInt(usuario_id)
    };
    
    console.log('[SERVER] Enviando payload a DB:', JSON.stringify(payload));
    const result = await db.request('/conversaciones', 'POST', payload);
    console.log('[SERVER] Conversación creada con éxito:', result);
    res.json(Array.isArray(result) ? result[0] : result);
  } catch (error) {
    // Mitigación para el error "0" de Flask que ocurre tras insertar con éxito
    if (error.message && error.message.includes('"error": "0"')) {
      console.log('[SERVER] Detectado error "0" fantasma de Flask. Intentando recuperar la conversación recién creada...');
      try {
        // Buscamos la última conversación de este usuario
        const convs = await db.request(`/conversaciones?usuario_id=eq.${usuario_id}`);
        if (Array.isArray(convs) && convs.length > 0) {
          // Ordenamos por ID descendente para obtener la más nueva
          const latest = convs.sort((a, b) => b.id - a.id)[0];
          console.log('[SERVER] Recuperación exitosa. ID:', latest.id);
          return res.json(latest);
        }
      } catch (recoveryError) {
        console.error('[SERVER] Falló la recuperación de la conversación:', recoveryError.message);
      }
    }

    console.error('[SERVER] ERROR CRÍTICO al crear conversación:', error.message);
    if (error.responseBody) console.error('[SERVER] Detalle del error de DB:', error.responseBody);
    res.status(500).json({ error: 'Error al crear conversación', details: error.message });
  }
});

app.patch('/api/conversations/:id', async (req, res) => {
  const { id } = req.params;
  const { nombre } = req.body;
  console.log(`[SERVER] Actualizando conversación ${id}:`, { nombre });
  
  try {
    // Según apiPostgres.md, el método para actualizar es PUT
    const result = await db.request(`/conversaciones/${id}`, 'PUT', { nombre });
    res.json(result);
  } catch (error) {
    console.error(`[SERVER] Error al actualizar conversación ${id}:`, error.message);
    res.status(500).json({ error: 'Error al actualizar conversación', details: error.message });
  }
});

app.delete('/api/conversations/:id', async (req, res) => {
  const { id } = req.params;
  try {
    console.log(`[SERVER] Iniciando borrado robusto de conversación ${id}...`);
    
    // 1. Obtener todos los mensajes de esta conversación para tener sus IDs
    const messages = await db.request(`/chat?conversacion_id=eq.${id}`);
    
    if (Array.isArray(messages) && messages.length > 0) {
      console.log(`[SERVER] Se encontraron ${messages.length} mensajes. Borrando uno a uno...`);
      // 2. Borrar cada mensaje individualmente por su ID (forma más compatible)
      for (const msg of messages) {
        try {
          await db.request(`/chat/${msg.id}`, 'DELETE');
        } catch (msgErr) {
          console.warn(`[SERVER] No se pudo borrar mensaje ${msg.id}, continuando...`);
        }
      }
      console.log(`[SERVER] Limpieza de mensajes completada.`);
    }

    // 3. Finalmente borrar la conversación por su ID
    await db.request(`/conversaciones/${id}`, 'DELETE');
    
    console.log(`[SERVER] Conversación ${id} eliminada con éxito.`);
    res.json({ success: true });
  } catch (error) {
    console.error(`[SERVER] FALLÓ el borrado de la conversación ${id}:`, error.message);
    res.status(500).json({ error: 'Error al eliminar conversación', details: error.message });
  }
});

app.get('/api/chat', async (req, res) => {
  const { conversacion_id } = req.query;
  if (!conversacion_id || conversacion_id === 'undefined' || conversacion_id === 'null') {
    return res.json([]);
  }
  try {
    const messages = await db.request(`/chat?conversacion_id=eq.${parseInt(conversacion_id)}`);
    res.json(messages || []);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener mensajes del chat' });
  }
});

app.post('/api/chat', async (req, res) => {
  try {
    const { usuario_id, conversacion_id, mensaje, respuesta } = req.body;
    console.log('--- POST /chat req.body ---', req.body);
    
    const uId = parseInt(usuario_id);
    const cId = parseInt(conversacion_id);

    if (isNaN(uId) || isNaN(cId)) {
      console.error('IDs inválidos:', { usuario_id, conversacion_id });
      return res.status(400).json({ error: 'usuario_id y conversacion_id son requeridos y deben ser números válidos' });
    }

    const payload = {
      usuario_id: uId,
      conversacion_id: cId,
      mensaje,
      respuesta
    };
    console.log('[SERVER] Guardando mensaje con payload:', JSON.stringify(payload));
    const result = await db.request('/chat', 'POST', payload);
    res.json(Array.isArray(result) ? result[0] : result);
  } catch (error) {
    console.error('[SERVER] ERROR al guardar mensaje:', error.message);
    const detail = error.responseBody || error.message;
    if (error.responseBody) console.error('[SERVER] Detalle error DB:', error.responseBody);
    
    // Si es el error fantasma "0" de la API Flask, lo tratamos como éxito porque hemos verificado que se guarda
    if (detail && detail.includes('"error": "0"')) {
      console.warn('[SERVER] Detectado error "0" de Flask, pero ignorado por ser falso negativo de inserción.');
      return res.json({ success: true, warning: 'inserted_with_error_0' });
    }
    
    res.status(500).json({ error: 'Error al guardar mensaje en el chat', details: detail });
  }
});

// --- User Exercise Progress ---
app.get('/api/user_ejer', async (req, res) => {
  const { user_id, ejer_id } = req.query;
  try {
    let query = '/user_ejer';
    if (user_id && ejer_id) {
      query += `?user_id=eq.${user_id}&ejer_id=eq.${ejer_id}`;
    } else if (user_id) {
      query += `?user_id=eq.${user_id}`;
    }
    const progress = await db.request(query);
    res.json(progress || []);
  } catch (error) {
    console.error('[SERVER] Error al obtener progreso:', error.message);
    res.status(500).json({ error: 'Error al obtener progreso' });
  }
});

app.post('/api/user_ejer', async (req, res) => {
  try {
    const { user_id, ejer_id, envio, estado } = req.body;
    const payload = {
      user_id: parseInt(user_id),
      ejer_id: parseInt(ejer_id),
      envio,
      estado: parseInt(estado),
      envio_send_time: new Error().stack ? new Date().toISOString() : new Date().toISOString() // Server time
    };
    
    // Primero buscamos si ya existe
    const existing = await db.request(`/user_ejer?user_id=eq.${user_id}&ejer_id=eq.${ejer_id}`);
    
    let result;
    if (Array.isArray(existing) && existing.length > 0) {
      // Actualizamos (asumiendo que tiene un ID o usando el endpoint con filtros si la API lo soporta)
      // La doc dice PUT /tabla/<id>. Si no tenemos ID, probamos con el primer ID encontrado.
      const id = existing[0].id;
      if (id) {
        result = await db.request(`/user_ejer/${id}`, 'PUT', payload);
      } else {
        // Si no hay ID único, tal vez la API no soporta PUT sin él. 
        // Intentamos POST de nuevo o error.
        throw new Error('No se pudo encontrar el ID para actualizar el progreso.');
      }
    } else {
      // Creamos
      result = await db.request('/user_ejer', 'POST', payload);
    }
    
    res.json(result);
  } catch (error) {
    if (error.message && error.message.includes('"error": "0"')) {
      return res.json({ success: true });
    }
    console.error('[SERVER] Error al guardar progreso:', error.message);
    res.status(500).json({ error: 'Error al guardar progreso', details: error.message });
  }
});

// --- Code Execution ---
app.post('/api/execute', async (req, res) => {
  const { code, language, input } = req.body;
  console.log(`[SERVER] Petición de ejecución recibida (${language})`);
  
  if (!code || !language) {
    return res.status(400).json({ error: 'Código y lenguaje son requeridos' });
  }
  
  try {
    const result = await db.executeCode(code, language, input || '');
    res.json(result);
  } catch (error) {
    console.error('[SERVER] Error al ejecutar código:', error.message);
    res.status(500).json({ error: 'Error al ejecutar código', details: error.message });
  }
});

// --- AI Proxy Endpoint ---
app.post('/api/ai/chat', async (req, res) => {
  const { systemInstruction, message, history } = req.body;
  const GEMINI_KEY = process.env.GEMINI_API_KEY;
  const XAI_KEY = process.env.XAI_API_KEY;

  // 1. Preparar historial para Gemini
  // Formato esperado: [{ role: "user", parts: [{ text: "..." }] }, { role: "model", parts: [{ text: "..." }] }]
  const geminiHistory = (history || []).flatMap(msg => [
    { role: "user", parts: [{ text: msg.mensaje }] },
    { role: "model", parts: [{ text: msg.respuesta }] }
  ]);
  
  // Añadimos el mensaje actual
  geminiHistory.push({ role: "user", parts: [{ text: message }] });

  try {
    // 1. Try Gemini (Using 2.5 Flash as requested by user)
    const geminiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: { 
          parts: [{ text: systemInstruction }] 
        },
        contents: geminiHistory,
        generationConfig: { 
          temperature: 0.8, 
          maxOutputTokens: 2048 
        }
      })
    });

    const data = await geminiRes.json();

    // Debug API response if it fails
    if (!geminiRes.ok) {
        console.error('[SERVER] Gemini API Error:', JSON.stringify(data, null, 2));
        throw new Error(`Gemini API Error: ${data.error?.message || geminiRes.statusText}`);
    }

    const aiText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (aiText) {
      return res.json({ model: 'Gemini 2.5', text: aiText });
    }
    throw new Error('Gemini returned empty candidates');

  } catch (error) {
    console.warn('[SERVER] Gemini 2.5 falló (probablemente cuota), probando Gemini 1.5 Flash...', error.message);
    
    try {
      // Fallback a Gemini 1.5 Flash (Tier gratuito mucho más amplio: 15 RPM)
      const gemini15Res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: systemInstruction }] },
          contents: geminiHistory,
          generationConfig: { temperature: 0.8, maxOutputTokens: 2048 }
        })
      });

      const data15 = await gemini15Res.json();
      if (gemini15Res.ok) {
        const aiText15 = data15.candidates?.[0]?.content?.parts?.[0]?.text;
        if (aiText15) {
          console.log('[SERVER] Respondido con éxito usando Gemini 1.5 Flash');
          return res.json({ model: 'Gemini 1.5', text: aiText15 });
        }
      }
      throw new Error(`Gemini 1.5 también falló: ${data15.error?.message || gemini15Res.statusText}`);
      
    } catch (error15) {
      console.warn('[SERVER] Gemini 1.5 falló, intentando último recurso (Groq)...', error15.message);
      try {
        // 2. Fallback Groq - Llama 3.3 70b
        const fallbackMessages = [
          { role: "system", content: systemInstruction },
          ...(history || []).flatMap(msg => [
            { role: "user", content: msg.mensaje },
            { role: "assistant", content: msg.respuesta }
          ]),
          { role: "user", content: message }
        ];

        const groqRes = await fetch(`https://api.groq.com/openai/v1/chat/completions`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
          },
          body: JSON.stringify({
            model: "llama-3.3-70b-versatile", 
            messages: fallbackMessages,
            temperature: 0.8
          })
        });

        const groqData = await groqRes.json();
        
        if (!groqRes.ok) {
          console.error('[SERVER] Groq API Error:', JSON.stringify(groqData, null, 2));
          throw new Error(`Groq API Error: ${groqData.error?.message || groqRes.statusText}`);
        }

        const groqText = groqData.choices?.[0]?.message?.content;

        if (groqText) {
          return res.json({ model: 'Groq (Llama 3.3)', text: groqText });
        }
        throw new Error('Groq returned empty response');
      } catch (fallbackError) {
        console.error('[SERVER] Fallback final fallido:', fallbackError.message);
        res.status(500).json({ error: 'Todos los modelos de IA fallaron', details: fallbackError.message });
      }
    }
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
