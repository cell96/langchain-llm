const admin = require('firebase-admin');

// Path to your Firebase service account key file
const serviceAccount = require('../../langchain-60377-firebase-adminsdk-ahlla-6fde5f6807.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// Get the Firestore database instance
const db = admin.firestore();

module.exports = db;
