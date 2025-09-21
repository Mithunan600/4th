const { getFirestore } = require('./firebaseAdmin');

function getDb() {
  const db = getFirestore();
  if (!db) return null;
  return db;
}

async function writeLog(collection, payload) {
  const db = getDb();
  if (!db) return;
  try {
    await db.collection(collection).add({
      ...payload,
      createdAt: new Date(),
    });
  } catch (e) {
    console.warn(`⚠️ Failed to write log to ${collection}:`, e.message);
  }
}

module.exports = {
  logAuthEvent: async (type, data = {}) => {
    await writeLog('auth_logs', { type, ...data });
  },
  logAnalysisEvent: async (type, data = {}) => {
    await writeLog('analysis_logs', { type, ...data });
  },
};


