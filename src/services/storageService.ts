import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { storage } from "@/lib/firebase";
import { v4 as uuidv4 } from "uuid";

// Pasta onde os arquivos de itens serão armazenados
const ITEMS_FOLDER = "items";

/**
 * Serviço para gerenciar arquivos no Firebase Storage
 */
export const storageService = {
  /**
   * Faz upload de um arquivo para o Firebase Storage
   * @param file - Arquivo a ser enviado
   * @param itemId - ID do item ao qual o arquivo pertence
   * @returns Objeto com informações do arquivo armazenado
   */
  async uploadItemFile(file: File, itemId: string) {
    try {
      // Criar um nome único para o arquivo usando UUID para evitar colisões
      const fileExtension = file.name.split('.').pop();
      const fileName = `${uuidv4()}.${fileExtension}`;
      
      // Definir o caminho completo no storage
      const filePath = `${ITEMS_FOLDER}/${itemId}/${fileName}`;
      const fileRef = ref(storage, filePath);
      
      // Realizar o upload
      const snapshot = await uploadBytes(fileRef, file);
      console.log('Arquivo enviado com sucesso:', snapshot);
      
      // Obter a URL de download
      const downloadURL = await getDownloadURL(fileRef);
      
      // Retornar informações do arquivo
      return {
        id: fileName,
        name: file.name,
        url: downloadURL,
        path: filePath,
        type: file.type.split('/')[0] === 'image' 
          ? 'image' 
          : file.type === 'application/pdf' 
            ? 'pdf' 
            : 'document',
        size: file.size,
        uploadDate: new Date()
      };
    } catch (error) {
      console.error('Erro ao fazer upload do arquivo:', error);
      throw error;
    }
  },
  
  /**
   * Exclui um arquivo do Firebase Storage
   * @param filePath - Caminho completo do arquivo no Storage
   */
  async deleteFile(filePath: string) {
    try {
      const fileRef = ref(storage, filePath);
      await deleteObject(fileRef);
      console.log('Arquivo excluído com sucesso:', filePath);
      return true;
    } catch (error) {
      console.error('Erro ao excluir arquivo:', error);
      throw error;
    }
  }
};
