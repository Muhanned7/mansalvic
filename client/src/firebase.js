import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  "apiKey": "AIzaSyCosFy01T18ifBDBTqLc3XaIR9Tw_-G-wQ",
  "authDomain": "mansalvic-org.firebaseapp.com",
  "projectId": "mansalvic-org",
  "storageBucket": "mansalvic-org.firebasestorage.app",
  "messagingSenderId": "653494525181",
  "appId": "1:653494525181:web:541dcf63bcda9f73d07294",
  "measurementId": "G-886KWSB7LH"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export default app;