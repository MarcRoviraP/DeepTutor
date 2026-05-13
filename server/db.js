require('dotenv').config();
// --- Database Client (API only) ---
// We no longer use direct pg connection here.


// --- REST API (for generic table access) ---
const API_URL = process.env.DB_API_URL;
const API_KEY = process.env.DB_API_KEY;

const apiRequest = async (endpoint, method = 'GET', data = null) => {
  const url = `${API_URL}${endpoint}`;
  const requestId = Math.random().toString(36).substring(7);

  console.log(`[DB-API][${requestId}] Request: ${method} ${url}`);
  const startTime = Date.now();

  const options = {
    method,
    headers: {
      'X-API-Key': API_KEY,
      'Content-Type': 'application/json'
    }
  };

  if (data) {
    console.log(`[DB-API][${requestId}] Payload:`, JSON.stringify(data, null, 2));
    options.body = JSON.stringify(data);
  }

  try {
    const response = await fetch(url, options);
    const duration = Date.now() - startTime;
    console.log(`[DB-API][${requestId}] Response Status: ${response.status} ${response.statusText} (took ${duration}ms)`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[DB-API][${requestId}] Error Body:`, errorText);
      const err = new Error(`API Error (${response.status}): ${errorText}`);
      err.responseBody = errorText;
      throw err;
    }

    const contentType = response.headers.get("content-type");
    if (contentType && contentType.indexOf("application/json") !== -1) {
      const json = await response.json();
      console.log(`[DB-API][${requestId}] Success! Data received (${Array.isArray(json) ? json.length + ' items' : 'Object'}).`);
      return json;
    } else {
      console.log(`[DB-API][${requestId}] Success! No JSON body to return.`);
      return null;
    }
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`\n[DB-API][${requestId}] ERROR CRÍTICO EN LA CONSULTA:`);
    console.error(`- URL: ${method} ${url}`);
    console.error(`- Mensaje: ${error.message}`);
    if (data) console.error(`- Payload enviado: ${JSON.stringify(data)}`);
    console.error(`--------------------------------------------\n`);
    throw error;
  }
};

module.exports = {
  // Generic request for other tables
  request: apiRequest,

  // Auth methods — using the API instead of direct DB connection
  createUser: async ({ google_id, email, nombre, picture, nivel }) => {
    console.log('[DB-API] Creating new user via API...');
    const result = await apiRequest('/usuarios', 'POST', {
      google_id,
      email,
      nombre,
      picture,
      nivel
    });
    // In PostgREST/standard APIs, POST might return the object or null.
    // If it's a list, we return the first item.
    return Array.isArray(result) ? result[0] : result;
  },

  findUserByGoogleIdOrEmail: async (googleId, email) => {
    console.log('[DB-API] Looking up user via API...');
    
    // 1. Try searching by google_id first
    let result = await apiRequest(`/usuarios?google_id=eq.${googleId}`);
    
    // If found and it's a non-empty array, return it
    if (Array.isArray(result) && result.length > 0) {
      return result;
    }

    // 2. If not found by google_id, try by email
    console.log('[DB-API] User not found by Google ID, searching by email...');
    result = await apiRequest(`/usuarios?email=eq.${email}`);
    
    return result || [];
  },

  executeCode: async (code, language, input = '') => {
    const url = `${API_URL}/execute`;
    const formData = new FormData();
    
    const extensions = {
        python: 'script.py',
        lua: 'script.lua',
        java: 'Main.java'
    };
    const fileName = extensions[language] || 'script.txt';
    
    const blob = new Blob([code], { type: 'text/plain' });
    formData.append('file', blob, fileName);
    formData.append('input', input);

    const options = {
      method: 'POST',
      headers: {
        'X-API-Key': API_KEY
      },
      body: formData
    };

    try {
      console.log(`[DB-API] Proxying execution request to ${url} (Lang: ${language})`);
      const response = await fetch(url, options);
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`[DB-API] Execution API Error (${response.status}):`, errorText);
        throw new Error(`Execution API Error (${response.status}): ${errorText}`);
      }
      const data = await response.json();
      console.log(`[DB-API] Execution success. Exit Code: ${data.exit_code}`);
      return data;
    } catch (error) {
      console.error('[DB-API] Critical error in executeCode proxy:', error);
      throw error;
    }
  }
};
