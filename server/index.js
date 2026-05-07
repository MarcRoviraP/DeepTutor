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
  console.log('--- Google Auth Attempt ---');
  console.log('Request body:', JSON.stringify(req.body));
  console.log('Credential received (first 10 chars):', credential ? credential.substring(0, 10) + '...' : 'NONE');
  console.log('Target Client ID (Server):', process.env.GOOGLE_CLIENT_ID);

  try {
    // 1. Verify the Google JWT
    console.log('Step 1: Verifying Google ID Token...');
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { sub: googleId, email, name, picture } = payload;
    console.log('✅ Token verified successfully for:', email);

    // 2. Check if user exists in DB via API
    console.log('Step 2: Looking up user in external DB API...');
    const users = await db.findUserByGoogleIdOrEmail(googleId, email);

    let user;

    if (users.length === 0) {
      console.log('Step 3: New user detected. Creating record via API...');
      // 3. Create new user if doesn't exist
      user = await db.createUser({
        google_id: googleId,
        email: email,
        nombre: name,
        picture: picture,
        nivel: 'principiante' // default level
      });
      console.log('✅ New user created successfully.');
    } else {
      user = users[0];
      console.log('✅ Existing user found. ID:', user.id);
    }

    // 4. Generate app-specific JWT
    console.log('Step 4: Generating app JWT...');
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET || 'your_super_secret_key',
      { expiresIn: '7d' }
    );

    // 5. Send response
    console.log('🚀 Login successful! Sending credentials to frontend.');
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
    console.error('❌ FAILED Google verification process.');
    console.error('Error Type:', error.name);
    console.error('Error Message:', error.message);
    
    if (error.message.includes('audience')) {
      console.error('CRITICAL: Audience mismatch. Check if frontend and backend use the EXACT same Client ID.');
    }
    
    res.status(401).json({ 
      error: 'Invalid Google token', 
      details: error.message 
    });
  }
  console.log('--- Auth Process Finished ---');
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
  console.log(`Server running on port ${PORT}`);
});
