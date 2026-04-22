const functions = require('firebase-functions');
const admin = require('firebase-admin');

// Initialize Firebase Admin
admin.initializeApp();

// Import endpoint handlers
const { sendPasswordReset } = require('./admin/sendPasswordReset');
const { deleteUser } = require('./admin/deleteUser');

/**
 * Wraps a handler with CORS headers that work for any origin.
 * Handles the OPTIONS preflight request explicitly so browsers
 * can call this function from any domain (e.g. Netlify).
 */
function withCors(handler) {
  return (req, res) => {
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    // Respond to preflight immediately
    if (req.method === 'OPTIONS') {
      return res.status(204).send('');
    }

    return handler(req, res);
  };
}

// Export Cloud Functions
exports.sendPasswordReset = functions.https.onRequest(withCors(sendPasswordReset));
exports.deleteUser = functions.https.onRequest(withCors(deleteUser));
