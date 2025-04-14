import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, collection, getDocs, query, limit } from 'firebase/firestore';
import { getStorage, ref, listAll } from 'firebase/storage';
import dotenv from 'dotenv';

dotenv.config();

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID
};

async function checkFirebaseHealth() {
  console.log('Iniciando verificação de saúde do Firebase...\n');
  
  try {
    // Inicializar Firebase
    const app = initializeApp(firebaseConfig);
    console.log('✅ Firebase inicializado com sucesso');

    // Verificar Auth
    const auth = getAuth(app);
    console.log('✅ Serviço de autenticação inicializado');

    // Verificar Firestore
    const db = getFirestore(app);
    const testQuery = query(collection(db, 'clients'), limit(1));
    await getDocs(testQuery);
    console.log('✅ Conexão com Firestore estabelecida');

    // Verificar Storage
    const storage = getStorage(app);
    const storageRef = ref(storage);
    await listAll(storageRef);
    console.log('✅ Conexão com Storage estabelecida');

    console.log('\n🎉 Todas as verificações passaram com sucesso!');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Erro durante a verificação:', error);
    process.exit(1);
  }
}

checkFirebaseHealth();
