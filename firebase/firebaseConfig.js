import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyD3B6CsLufB8Cjq40Q7mDq-GFQbvfXpVYw",
  authDomain: "pokeapi2-88e8f.firebaseapp.com",
  projectId: "pokeapi2-88e8f",
  storageBucket: "pokeapi2-88e8f.firebasestorage.app",
  messagingSenderId: "279201153786",
  appId: "1:279201153786:web:2bee4d3e99c828afef3f43"

};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app); // ✅ ¡Esto es necesario!

export { auth, db };