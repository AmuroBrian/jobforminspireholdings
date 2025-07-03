import { initializeApp, getApps } from "firebase/app";
import { getStorage } from "firebase/storage";
import { getFirestore } from "firebase/firestore"; 
// Only initialize once (for Next.js hot-reloading)
const firebaseConfig = {
  apiKey: "AIzaSyAZU33VLCtV3AEfGKSX_xpXOCAePiHyZ0M",
  authDomain: "ingi-applicant.firebaseapp.com",
  projectId: "ingi-applicant",
  storageBucket: "ingi-applicant.firebasestorage.app",
  messagingSenderId: "879523455864",
  appId: "1:879523455864:web:059ec1daf5326d32189e8d",
  measurementId: "G-Z8CMR3X9SM"
};


const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];
const db = getFirestore(app);
const storage = getStorage(app);

export { app, db, storage };