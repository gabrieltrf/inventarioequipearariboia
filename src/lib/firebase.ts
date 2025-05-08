import { initializeApp } from "firebase/app";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";
import { enableIndexedDbPersistence } from "firebase/firestore";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCB003CBHpyZLzoQIK9smNbe1_5Krap9t0",
  authDomain: "arariinventario.firebaseapp.com",
  projectId: "arariinventario",
  storageBucket: "arariinventario.firebasestorage.app", // Correção no storageBucket
  messagingSenderId: "760406378525",
  appId: "1:760406378525:web:5ce4987c9b38d213a89ef4"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);

// Habilitar persistência offline (opcional)
if (process.env.NODE_ENV !== 'development') {
  enableIndexedDbPersistence(db)
    .catch((err) => {
      if (err.code === 'failed-precondition') {
        console.warn('Persistência falhou, possivelmente múltiplas abas abertas');
      } else if (err.code === 'unimplemented') {
        console.warn('O navegador não suporta persistência offline');
      }
    });
}

// Log da inicialização para debug
console.log("Firebase inicializado com sucesso para o projeto:", firebaseConfig.projectId);
