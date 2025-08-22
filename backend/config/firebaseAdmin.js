const admin = require('firebase-admin');

// This line points to the key file you just downloaded and moved.
const serviceAccount = require('../serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

// This db object is the Admin SDK's connection to Firestore.
const db = admin.firestore();

module.exports = { db };