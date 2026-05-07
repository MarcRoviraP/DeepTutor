require('dotenv').config();

const API_URL = process.env.DB_API_URL;
const API_KEY = process.env.DB_API_KEY;

const apiRequest = async (endpoint, method = 'GET', data = null) => {
  const url = `${API_URL}${endpoint}`;
  
  console.log(`[DB-API] Request: ${method} ${url}`);
  console.log(`[DB-API] Headers: { 'X-API-Key': '${API_KEY ? '****' + API_KEY.slice(-4) : 'MISSING'}', 'Content-Type': 'application/json' }`);
  
  const options = {
    method,
    headers: {
      'X-API-Key': API_KEY,
      'Content-Type': 'application/json'
    }
  };

  if (data) {
    console.log(`[DB-API] Payload:`, JSON.stringify(data, null, 2));
    options.body = JSON.stringify(data);
  }

  try {
    const response = await fetch(url, options);
    console.log(`[DB-API] Response Status: ${response.status} ${response.statusText}`);
    
    const contentType = response.headers.get("content-type");
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[DB-API] Error Body:`, errorText);
      throw new Error(`API Error (${response.status}): ${errorText}`);
    }

    if (contentType && contentType.indexOf("application/json") !== -1) {
      const json = await response.json();
      console.log(`[DB-API] Success! Data received (${Array.isArray(json) ? json.length + ' items' : 'Object'}).`);
      return json;
    } else {
      console.log(`[DB-API] Success! No JSON body to return.`);
      return null;
    }
  } catch (error) {
    console.error(`[DB-API] CRITICAL FAILURE on ${url}:`, error.message);
    throw error;
  }
};

module.exports = {
  // Generic request for other tables
  request: apiRequest,
  
  // Specific methods for Auth
  getUsers: () => apiRequest('/usuarios'),
  
  createUser: (userData) => apiRequest('/usuarios', 'POST', userData),
  
  findUserByGoogleIdOrEmail: async (googleId, email) => {
    const users = await apiRequest('/usuarios');
    // If users is not an array (API might return an object or error), handle it
    if (!Array.isArray(users)) {
      console.warn('API /usuarios did not return an array:', users);
      return [];
    }
    return users.filter(u => u.google_id === googleId || u.email === email);
  }
};
