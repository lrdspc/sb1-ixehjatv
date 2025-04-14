import { FirestoreDataConverter } from "@firebase/firestore";
import type { 
  FirestoreInspection, 
  FirestoreClient, 
  FirestoreTile,
  FirestoreNonconformity,
  FirestoreUserProfile 
} from "./firestore";

// Converter para Inspeções
export const inspectionConverter: FirestoreDataConverter<FirestoreInspection> = {
  toFirestore: (inspection) => {
    return {
      ...inspection,
      inspection_date: inspection.inspection_date,
      created_at: inspection.created_at,
      updated_at: inspection.updated_at
    };
  },
  fromFirestore: (snapshot, options) => {
    const data = snapshot.data(options);
    return {
      ...data,
      id: snapshot.id
    } as FirestoreInspection;
  }
};

// Converter para Clientes
export const clientConverter: FirestoreDataConverter<FirestoreClient> = {
  toFirestore: (client) => {
    return {
      ...client,
      created_at: client.created_at,
      updated_at: client.updated_at
    };
  },
  fromFirestore: (snapshot, options) => {
    const data = snapshot.data(options);
    return {
      ...data,
      id: snapshot.id
    } as FirestoreClient;
  }
};

// Converter para Telhas
export const tileConverter: FirestoreDataConverter<FirestoreTile> = {
  toFirestore: (tile) => {
    return {
      ...tile,
      created_at: tile.created_at
    };
  },
  fromFirestore: (snapshot, options) => {
    const data = snapshot.data(options);
    return {
      ...data,
      id: snapshot.id
    } as FirestoreTile;
  }
};

// Converter para Não-conformidades
export const nonconformityConverter: FirestoreDataConverter<FirestoreNonconformity> = {
  toFirestore: (nonconformity) => {
    return {
      ...nonconformity,
      created_at: nonconformity.created_at
    };
  },
  fromFirestore: (snapshot, options) => {
    const data = snapshot.data(options);
    return {
      ...data,
      id: snapshot.id
    } as FirestoreNonconformity;
  }
};

// Converter para Perfis de Usuário
export const userProfileConverter: FirestoreDataConverter<FirestoreUserProfile> = {
  toFirestore: (profile) => {
    return {
      ...profile,
      created_at: profile.created_at,
      updated_at: profile.updated_at
    };
  },
  fromFirestore: (snapshot, options) => {
    const data = snapshot.data(options);
    return {
      ...data,
      id: snapshot.id
    } as FirestoreUserProfile;
  }
};
