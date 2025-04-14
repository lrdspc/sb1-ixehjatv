import { getFirestore, collection, doc, getDoc, getDocs, addDoc, updateDoc, deleteDoc, query, where, orderBy, limit } from 'firebase/firestore';
import { app } from './firebase';
import {
  inspectionConverter,
  clientConverter,
  tileConverter,
  nonconformityConverter,
  userProfileConverter
} from './firebase-converters';
import type {
  FirestoreInspection,
  FirestoreClient,
  FirestoreTile,
  FirestoreNonconformity,
  FirestoreUserProfile
} from '../types/firestore';

const db = getFirestore(app);

// Coleções com conversores
const inspections = collection(db, 'inspections').withConverter(inspectionConverter);
const clients = collection(db, 'clients').withConverter(clientConverter);
const tiles = collection(db, 'inspection_tiles').withConverter(tileConverter);
const nonconformities = collection(db, 'nonconformities').withConverter(nonconformityConverter);
const userProfiles = collection(db, 'users_profiles').withConverter(userProfileConverter);

export async function fetchData<T>(
  collectionName: string,
  options?: {
    filter?: Record<string, any>;
    orderBy?: string;
    limit?: number;
  }
): Promise<T[]> {
  try {
    // Selecionar coleção com conversor apropriado
    let collectionRef;
    switch (collectionName) {
      case 'inspections':
        collectionRef = inspections;
        break;
      case 'clients':
        collectionRef = clients;
        break;
      case 'inspection_tiles':
        collectionRef = tiles;
        break;
      case 'nonconformities':
        collectionRef = nonconformities;
        break;
      case 'users_profiles':
        collectionRef = userProfiles;
        break;
      default:
        collectionRef = collection(db, collectionName);
    }

    let q = query(collectionRef);

    if (options?.filter) {
      Object.entries(options.filter).forEach(([key, value]) => {
        q = query(q, where(key, '==', value));
      });
    }

    if (options?.orderBy) {
      q = query(q, orderBy(options.orderBy));
    }

    if (options?.limit) {
      q = query(q, limit(options.limit));
    }

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as T[];
  } catch (error) {
    console.error(`Erro ao buscar dados da coleção ${collectionName}:`, error);
    throw error;
  }
}

export async function insertData<T>(
  collectionName: string,
  data: Omit<T, 'id'>
): Promise<T> {
  try {
    const docRef = await addDoc(collection(db, collectionName), {
      ...data,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });

    const newDoc = await getDoc(docRef);
    return { id: newDoc.id, ...newDoc.data() } as T;
  } catch (error) {
    console.error(`Erro ao inserir dados na coleção ${collectionName}:`, error);
    throw error;
  }
}

export async function updateData<T>(
  collectionName: string,
  id: string,
  data: Partial<T>
): Promise<void> {
  try {
    const docRef = doc(db, collectionName, id);
    await updateDoc(docRef, {
      ...data,
      updated_at: new Date().toISOString()
    });
  } catch (error) {
    console.error(`Erro ao atualizar documento ${id} na coleção ${collectionName}:`, error);
    throw error;
  }
}

export async function deleteData(
  collectionName: string,
  id: string
): Promise<void> {
  try {
    await deleteDoc(doc(db, collectionName, id));
  } catch (error) {
    console.error(`Erro ao excluir documento ${id} da coleção ${collectionName}:`, error);
    throw error;
  }
}
