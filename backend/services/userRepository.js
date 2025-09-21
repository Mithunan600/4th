const { getFirestore } = require('./firebaseAdmin');
const admin = require('firebase-admin');

const USERS_COLLECTION = 'users';

function getDb() {
  const db = getFirestore();
  if (!db) {
    throw new Error('Firestore not initialized');
  }
  return db;
}

function formatPhone(phone) {
  return (phone || '').trim();
}

module.exports = {
  async findByPhone(phone) {
    const db = getDb();
    const qSnap = await db
      .collection(USERS_COLLECTION)
      .where('phone', '==', formatPhone(phone))
      .limit(1)
      .get();
    if (qSnap.empty) return null;
    const doc = qSnap.docs[0];
    return { id: doc.id, ...doc.data() };
  },

  async phoneExists(phone) {
    const db = getDb();
    const qSnap = await db
      .collection(USERS_COLLECTION)
      .where('phone', '==', formatPhone(phone))
      .limit(1)
      .get();
    return !qSnap.empty;
  },

  async findById(id) {
    const db = getDb();
    const doc = await db.collection(USERS_COLLECTION).doc(id).get();
    return doc.exists ? { id: doc.id, ...doc.data() } : null;
  },

  async findByEmail(email) {
    const db = getDb();
    const qSnap = await db
      .collection(USERS_COLLECTION)
      .where('email', '==', (email || '').toLowerCase())
      .limit(1)
      .get();
    if (qSnap.empty) return null;
    const doc = qSnap.docs[0];
    return { id: doc.id, ...doc.data() };
  },

  async createOrUpdateTempByPhone(phone, defaults = {}) {
    const db = getDb();
    const normalizedPhone = formatPhone(phone);
    const existing = await this.findByPhone(normalizedPhone);
    const data = {
      phone: normalizedPhone,
      isPhoneVerified: false,
      analysisCount: 0,
      diseasesDetected: 0,
      plantsSaved: 0,
      lastLogin: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
      ...defaults,
    };
    if (existing) {
      await db.collection(USERS_COLLECTION).doc(existing.id).set({
        ...existing,
        ...data,
      }, { merge: true });
      return { ...existing, ...data, id: existing.id };
    } else {
      const docRef = await db.collection(USERS_COLLECTION).add(data);
      return { ...data, id: docRef.id };
    }
  },

  async setOtp(userId, otpCode, expiresAt) {
    const db = getDb();
    await db.collection(USERS_COLLECTION).doc(userId).set({
      otp: { code: otpCode, expiresAt },
      updatedAt: new Date(),
    }, { merge: true });
  },

  async verifyAndClearOtpByPhone(phone, otp) {
    const user = await this.findByPhone(phone);
    if (!user || !user.otp || !user.otp.code || !user.otp.expiresAt) return false;
    if (new Date() > new Date(user.otp.expiresAt)) return false;
    const isValid = user.otp.code === otp;
    if (!isValid) return false;
    const db = getDb();
    await db.collection(USERS_COLLECTION).doc(user.id).set({
      otp: admin.firestore.FieldValue.delete(),
      isPhoneVerified: true,
      lastLogin: new Date(),
      updatedAt: new Date(),
    }, { merge: true });
    return { ...user, isPhoneVerified: true, otp: undefined };
  },

  async updateProfile(userId, name, email) {
    const db = getDb();
    const payload = {
      name: (name || '').trim(),
      email: (email || '').toLowerCase().trim(),
      updatedAt: new Date(),
    };
    await db.collection(USERS_COLLECTION).doc(userId).set(payload, { merge: true });
    const updated = await this.findById(userId);
    return updated;
  },

  async upsertFromFirebaseClaims(claims) {
    const db = getDb();
    const email = (claims.email || '').toLowerCase();
    const phone = formatPhone(claims.phone_number || '');
    const uid = claims.user_id || claims.uid;
    const name = claims.name || '';

    // Try find by uid
    let q = await db.collection(USERS_COLLECTION).where('uid', '==', uid).limit(1).get();
    if (q.empty && email) {
      q = await db.collection(USERS_COLLECTION).where('email', '==', email).limit(1).get();
    }
    if (q.empty && phone) {
      q = await db.collection(USERS_COLLECTION).where('phone', '==', phone).limit(1).get();
    }

    const base = {
      uid,
      email,
      phone,
      name,
      isPhoneVerified: !!phone,
      lastLogin: new Date(),
      updatedAt: new Date(),
    };

    if (!q.empty) {
      const doc = q.docs[0];
      await db.collection(USERS_COLLECTION).doc(doc.id).set(base, { merge: true });
      const updated = await this.findById(doc.id);
      return updated;
    }

    const data = {
      analysisCount: 0,
      diseasesDetected: 0,
      plantsSaved: 0,
      createdAt: new Date(),
      ...base,
    };
    const ref = await db.collection(USERS_COLLECTION).add(data);
    return { id: ref.id, ...data };
  },
};


