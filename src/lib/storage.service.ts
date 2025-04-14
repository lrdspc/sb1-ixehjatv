import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { app } from './firebase';

const storage = getStorage(app);

export async function uploadFile(
  path: string,
  file: File,
  options?: { contentType?: string }
): Promise<string> {
  try {
    const storageRef = ref(storage, path);
    const result = await uploadBytes(storageRef, file, {
      contentType: options?.contentType
    });
    
    // Obter a URL pública do arquivo
    const downloadURL = await getDownloadURL(result.ref);
    return downloadURL;
  } catch (error) {
    console.error('Erro ao fazer upload do arquivo:', error);
    throw error;
  }
}

export async function deleteFile(path: string): Promise<void> {
  try {
    const storageRef = ref(storage, path);
    await storageRef.delete();
  } catch (error) {
    console.error('Erro ao excluir arquivo:', error);
    throw error;
  }
}
