import { Timestamp } from 'firebase/firestore';

export interface FirestoreInspection {
  id: string;
  client_id: string;
  status: string;
  inspection_date: Timestamp;
  building_type: string;
  construction_year: number;
  roof_area: number;
  last_maintenance: string;
  main_issue: string;
  created_at: Timestamp;
  updated_at: Timestamp;
  created_by: string;
  photos: string[];
  nonconformities: FirestoreNonconformity[];
  tiles: FirestoreTile[];
}

export interface FirestoreClient {
  id: string;
  name: string;
  type: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  contact_name: string;
  contact_phone: string;
  contact_email: string;
  created_at: Timestamp;
  updated_at: Timestamp;
}

export interface FirestoreTile {
  id: string;
  inspection_id: string;
  position: number;
  condition: string;
  observations: string;
  photos: string[];
  created_at: Timestamp;
}

export interface FirestoreNonconformity {
  id: string;
  inspection_id: string;
  type: string;
  description: string;
  severity: string;
  photos: string[];
  created_at: Timestamp;
}

export interface FirestoreUserProfile {
  id: string;
  full_name: string | null;
  email: string;
  avatar_url: string | null;
  created_at: Timestamp;
  updated_at: Timestamp;
}
