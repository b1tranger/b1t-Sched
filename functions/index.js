const functions = require('firebase-functions');
const admin = require('firebase-admin');
const cors = require('cors')({ origin: true });

// Initialize Firebase Admin
admin.initializeApp();

// Import endpoint handlers
const { sendPasswordReset } = require('./admin/sendPasswordReset');
const { deleteUser } = require('./admin/deleteUser');

// Export Cloud Functions
exports.sendPasswordReset = functions.https.onRequest((req, res) => {
  cors(req, res, () => sendPasswordReset(req, res));
});

exports.deleteUser = functions.https.onRequest((req, res) => {
  cors(req, res, () => deleteUser(req, res));
});
