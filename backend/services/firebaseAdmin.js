const admin = require("firebase-admin");
const serviceAccount = require("../serviceAccountKey.json");

let isInitialized = false;

function initializeFirebaseAdmin() {
  if (isInitialized) {
    return admin;
  }

  try {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      storageBucket: serviceAccount.project_id + ".appspot.com", // optional
    });
    isInitialized = true;
    console.log("✅ Firebase Admin initialized using serviceAccountKey.json");
  } catch (error) {
    if (!/already exists/u.test(error.message)) {
      console.error("❌ Failed to initialize Firebase Admin:", error.message);
      throw error;
    }
  }

  return admin;
}

module.exports = {
  initializeFirebaseAdmin,
  getFirestore: () => {
    const app = initializeFirebaseAdmin();
    return app ? app.firestore() : null;
  },
  getStorageBucket: () => {
    const app = initializeFirebaseAdmin();
    return app ? app.storage().bucket() : null;
  },
};