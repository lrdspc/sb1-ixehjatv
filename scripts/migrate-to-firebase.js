import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { createClient } from '@supabase/supabase-js';
import { Timestamp } from 'firebase-admin/firestore';
import dotenv from 'dotenv';

dotenv.config();

// Inicializar Firebase Admin
initializeApp({
  credential: cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
  })
});

// Inicializar Supabase
const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

const db = getFirestore();

async function migrateData() {
  try {
    console.log('Iniciando migração de dados...');

    // Migrar usuários
    console.log('Migrando perfis de usuários...');
    const { data: profiles, error: profilesError } = await supabase
      .from('users_profiles')
      .select('*');
    
    if (profilesError) throw profilesError;

    for (const profile of profiles) {
      await db.collection('users_profiles').doc(profile.id).set({
        ...profile,
        created_at: Timestamp.fromDate(new Date(profile.created_at)),
        updated_at: Timestamp.fromDate(new Date(profile.updated_at))
      });
    }

    // Migrar clientes
    console.log('Migrando clientes...');
    const { data: clients, error: clientsError } = await supabase
      .from('clients')
      .select('*');
    
    if (clientsError) throw clientsError;

    for (const client of clients) {
      await db.collection('clients').doc(client.id).set({
        ...client,
        created_at: Timestamp.fromDate(new Date(client.created_at)),
        updated_at: Timestamp.fromDate(new Date(client.updated_at))
      });
    }

    // Migrar inspeções
    console.log('Migrando inspeções...');
    const { data: inspections, error: inspectionsError } = await supabase
      .from('inspections')
      .select('*');
    
    if (inspectionsError) throw inspectionsError;

    for (const inspection of inspections) {
      await db.collection('inspections').doc(inspection.id).set({
        ...inspection,
        created_at: Timestamp.fromDate(new Date(inspection.created_at)),
        updated_at: Timestamp.fromDate(new Date(inspection.updated_at)),
        inspection_date: Timestamp.fromDate(new Date(inspection.inspection_date))
      });
    }

    console.log('Migração concluída com sucesso!');
  } catch (error) {
    console.error('Erro durante a migração:', error);
    process.exit(1);
  }
}

migrateData();
