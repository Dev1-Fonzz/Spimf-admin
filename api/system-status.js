// api/system-status.js
let systemState = {
  blocked: false,
  blockReason: "",
  lastUpdated: new Date().toISOString(),
  broadcastMessage: ""
};

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', 'https://spimf-membership.vercel.app');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Handle preflight request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // Verify token
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token diperlukan' });
  }
  
  const token = authHeader.replace('Bearer ', '');
  if (token !== process.env.VERCEL_ACCESS_TOKEN) {
    return res.status(401).json({ error: 'Token tidak sah' });
  }

  try {
    // GET request - untuk sistem member check status
    if (req.method === 'GET') {
      return res.status(200).json({
        success: true,
        data: systemState
      });
    }
    
    // POST request - untuk admin update status
    if (req.method === 'POST') {
      const { action, reason, message } = req.body;
      
      if (action === 'block') {
        systemState = {
          ...systemState,
          blocked: true,
          blockReason: reason || "Sistem di-block oleh admin",
          lastUpdated: new Date().toISOString()
        };
      } 
      else if (action === 'unblock') {
        systemState = {
          ...systemState,
          blocked: false,
          blockReason: "",
          lastUpdated: new Date().toISOString()
        };
      }
      else if (action === 'broadcast') {
        systemState = {
          ...systemState,
          broadcastMessage: message || "",
          lastUpdated: new Date().toISOString()
        };
      }
      
      return res.status(200).json({
        success: true,
        message: `Action ${action} berjaya`,
        data: systemState
      });
    }
    
    return res.status(405).json({ error: 'Method tidak dibenarkan' });
    
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
}
