import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

// Replace with your Firebase Web SDK config
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || 'AIzaSyDNrnQHHoA95YCYkJKrnuzVt_kyTfZ9mK4',
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || 'thyear-c9bf7.firebaseapp.com',
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || 'thyear-c9bf7',
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || 'thyear-c9bf7.appspot.com',
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || '470838295257',
  appId: process.env.REACT_APP_FIREBASE_APP_ID || '1:470838295257:web:8bfda03f19fcb0260b1cc8',
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID || 'G-NR46V1MX8V',
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export { app, auth, googleProvider };


