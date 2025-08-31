const admin = require('firebase-admin');

// --- THIS IS THE NEW PART ---
// Decode the Base64 service account key from environment variables
const serviceAccountFromBase64 = Buffer.from(
  process.env.FIREBASE_SERVICE_ACCOUNT_BASE64, 'base64'
).toString('ascii');
const serviceAccount = JSON.parse(serviceAccountFromBase64);
// --- END OF NEW PART ---

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();
module.exports = { db, admin };