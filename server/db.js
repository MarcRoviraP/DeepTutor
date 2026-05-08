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
      throw new Error(`API Error (${response.status}): ${errorText}`);
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
    console.error(`[DB-API][${requestId}] CRITICAL FAILURE on ${url} (after ${duration}ms):`, error.message);
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
    // We use the 'or' operator from PostgREST to search by google_id OR email
    const result = await apiRequest(`/usuarios?or=(google_id.eq.${googleId},email.eq.${email})`);
    return result || [];
  },
};
