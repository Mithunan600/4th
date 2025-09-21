const { getFirestore } = require('./firebaseAdmin');

function getDb() {
  const db = getFirestore();
  if (!db) throw new Error('Firestore not initialized');
  return db;
}

const COLLECTION = 'users';
const SUBCOLLECTION = 'history';

module.exports = {
  async addEntry(userId, entry) {
    const db = getDb();
    const payload = {
      plantName: entry.plantName || 'Unknown Plant',
      symptoms: entry.symptoms || '',
      answer: entry.answer || '',
      structured: entry.structured || null,
      uploadedUrl: entry.uploadedUrl || null,
      createdAt: new Date(),
    };
    const ref = await db
      .collection(COLLECTION)
      .doc(userId)
      .collection(SUBCOLLECTION)
      .add(payload);
    try {
      console.log(`🗂️ History saved for user ${userId}: ${ref.id} (${payload.plantName})`);
    } catch (_) {}
    return { id: ref.id, ...payload };
  },

  async listEntries(userId, queryText) {
    const db = getDb();
    let q = db
      .collection(COLLECTION)
      .doc(userId)
      .collection(SUBCOLLECTION)
      .orderBy('createdAt', 'desc')
      .limit(100);

    const snap = await q.get();
    let results = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    if (queryText && queryText.trim()) {
      const qLower = queryText.trim().toLowerCase();
      results = results.filter(r =>
        (r.plantName || '').toLowerCase().includes(qLower) ||
        (r.answer || '').toLowerCase().includes(qLower) ||
        (r.symptoms || '').toLowerCase().includes(qLower)
      );
    }
    return results;
  }
};


