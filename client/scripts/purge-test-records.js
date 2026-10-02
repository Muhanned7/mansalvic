import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, deleteDoc, doc } from 'firebase/firestore';

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
const db = getFirestore(app);

async function purgeAllTestRecords() {
  console.log('--- Starting Firestore Test Records Purge (Round 10) ---');
  let deletedCount = 0;

  // 1. Purge from 'leads'
  const leadsSnap = await getDocs(collection(db, 'leads'));
  for (const docSnap of leadsSnap.docs) {
    const data = docSnap.data();
    const email = (data.contactInfo?.email || data.clientEmail || data.email || '').toLowerCase();
    const ref = (data.referenceCode || '').toUpperCase();
    const id = docSnap.id;

    if (
      email.includes('qa-test') ||
      ref === 'MSV-2026-S3JH' ||
      email.includes('example.com')
    ) {
      console.log(`Deleting test lead: [${id}] ${email} (Ref: ${ref})`);
      await deleteDoc(doc(db, 'leads', id));
      deletedCount++;
    }
  }

  // 2. Purge from 'appointments'
  const aptSnap = await getDocs(collection(db, 'appointments'));
  for (const docSnap of aptSnap.docs) {
    const data = docSnap.data();
    const email = (data.clientEmail || data.email || '').toLowerCase();
    const id = docSnap.id;

    if (
      id === '30PYtteCjgoNLWILMIHf' ||
      id.toUpperCase() === '30PYTTECJG' ||
      email.includes('qa-test') ||
      email.includes('example.com')
    ) {
      console.log(`Deleting test appointment: [${id}] ${email}`);
      await deleteDoc(doc(db, 'appointments', id));
      deletedCount++;
    }
  }

  // Specific target deletion directly by ID just in case
  try {
    await deleteDoc(doc(db, 'appointments', '30PYtteCjgoNLWILMIHf'));
    console.log('Confirmed deleteDoc call on appointments/30PYtteCjgoNLWILMIHf');
  } catch (e) {
    console.log('Target direct delete check:', e.message);
  }

  console.log(`--- Purge complete. Total deleted records: ${deletedCount} ---`);
  process.exit(0);
}

purgeAllTestRecords().catch(err => {
  console.error('Purge error:', err);
  process.exit(1);
});
