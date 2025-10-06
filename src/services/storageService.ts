import { ref, uploadBytes, getDownloadURL, deleteObject, listAll } from "firebase/storage";
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
  },

  /**
   * Exclui um arquivo do Firebase Storage usando sua URL de download
   * @param fileUrl - URL de download do arquivo no Storage
   */
  async deleteFileByUrl(fileUrl: string) {
    if (!fileUrl) return false;
    try {
      // Extrai o caminho do arquivo a partir da URL
      const baseUrl = `https://firebasestorage.googleapis.com/v0/b/${storage.app.options.storageBucket}/o/`;
      if (!fileUrl.startsWith(baseUrl)) {
        throw new Error("URL de arquivo inválida para este bucket.");
      }
      const encodedPath = fileUrl.substring(baseUrl.length, fileUrl.indexOf('?'));
      const filePath = decodeURIComponent(encodedPath);
      const fileRef = ref(storage, filePath);
      await deleteObject(fileRef);
      console.log('Arquivo excluído com sucesso pela URL:', fileUrl);
      return true;
    } catch (error) {
      // Firebase throws an error if the object does not exist, or if the URL is invalid.
      // We can choose to log this as a warning or an error.
      // If the file not existing is an acceptable state (e.g., already deleted), don't throw.
      if ((error as any).code === 'storage/object-not-found') {
        console.warn('Arquivo não encontrado para exclusão (pode já ter sido excluído):', fileUrl, error);
        return true; // Consider success if it's already gone
      }
      console.error('Erro ao excluir arquivo pela URL:', fileUrl, error);
      throw error; // Re-throw for other types of errors
    }
  },
  
  /**
   * Exclui todos os arquivos de um item do Firebase Storage
   * @param itemId - ID do item cujos arquivos serão excluídos
   */
  async deleteItemFolder(itemId: string) {
    try {
      // Referência para a pasta do item
      const itemFolderRef = ref(storage, `${ITEMS_FOLDER}/${itemId}`);
      
      // Lista todos os arquivos na pasta
      const result = await listAll(itemFolderRef);
      
      // Exclui cada arquivo individualmente
      const deletePromises = result.items.map(item => deleteObject(item));
      
      // Aguarda a exclusão de todos os arquivos
      await Promise.all(deletePromises);
      
      // Também lista e exclui todos os arquivos em subpastas, se houver
      const folderDeletePromises = result.prefixes.map(async (prefix) => {
        const subfolderResult = await listAll(prefix);
        const subDeletePromises = subfolderResult.items.map(item => deleteObject(item));
        return Promise.all(subDeletePromises);
      });
      
      await Promise.all(folderDeletePromises);
      
      console.log(`Todos os arquivos do item ${itemId} foram excluídos com sucesso`);
      return true;
    } catch (error) {
      console.error(`Erro ao excluir arquivos do item ${itemId}:`, error);
      // Não lançamos o erro para não interromper o fluxo de exclusão do item
      // mesmo se houver problemas com a exclusão dos arquivos
      return false;
    }
  }
};
