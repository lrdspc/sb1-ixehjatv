import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';
import { app } from './firebase';
import { updateProfile, User } from 'firebase/auth';

const db = getFirestore(app);

interface UserProfile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export async function sync_user_profile(user: User, user_data: {
  full_name?: string;
  avatar_url?: string;
}): Promise<UserProfile | null> {
  try {
    // Atualizar perfil no Firebase Auth
    if (user_data.full_name) {
      await updateProfile(user, {
        displayName: user_data.full_name
      });
    }

    // Buscar ou criar documento do perfil no Firestore
    const userRef = doc(db, 'users_profiles', user.uid);
    const userDoc = await getDoc(userRef);

    const profile_data = {
      id: user.uid,
      full_name: user_data.full_name || user.displayName || null,
      avatar_url: user_data.avatar_url || null,
      updated_at: new Date().toISOString()
    };

    if (!userDoc.exists()) {
      // Criar novo perfil
      await setDoc(userRef, {
        ...profile_data,
        created_at: new Date().toISOString()
      });
    } else {
      // Atualizar perfil existente
      await setDoc(userRef, profile_data, { merge: true });
    }

    const updatedDoc = await getDoc(userRef);
    return updatedDoc.data() as UserProfile;
  } catch (err) {
    console.error('Erro ao sincronizar perfil:', err);
    return null;
  }
}

export async function get_user_profile(user_id: string): Promise<UserProfile | null> {
  try {
    const userRef = doc(db, 'users_profiles', user_id);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      return null;
    }

    return userDoc.data() as UserProfile;
  } catch (err) {
    console.error('Erro ao buscar perfil:', err);
    return null;
  }
}

export async function update_user_profile(
  user_id: string,
  updates: Partial<UserProfile>
): Promise<UserProfile | null> {
  try {
    const userRef = doc(db, 'users_profiles', user_id);
    await setDoc(userRef, {
      ...updates,
      updated_at: new Date().toISOString()
    }, { merge: true });

    const updatedDoc = await getDoc(userRef);
    return updatedDoc.data() as UserProfile;
  } catch (err) {
    console.error('Erro ao atualizar perfil:', err);
    return null;
  }
}
