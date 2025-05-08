import { collection, doc, setDoc, getDoc, getDocs } from "firebase/firestore";
import { db } from "../lib/firebase";
import { ItemStatus } from "@/types";
import { serverTimestamp } from "firebase/firestore";

// Coleções que precisamos inicializar
const COLLECTIONS = {
  LOCATIONS: "locations",
  ITEMS: "items",
  MOVEMENTS: "movements",
  LOANS: "loans",
  CATEGORIES: "categories"
};

// Dados iniciais para cada coleção
const initialData = {
  // Categorias iniciais
  categories: [
    { id: "cat1", name: "Elétrica" },
    { id: "cat2", name: "Mecânica" },
    { id: "cat3", name: "Ferramentas" },
    { id: "cat4", name: "EPIs" },
    { id: "cat5", name: "Eletrônica" }
  ],
  
  // Uma localização de exemplo
  locations: [
    { 
      id: "loc1",
      name: "Almoxarifado Principal",
      description: "Almoxarifado principal da equipe",
      capacity: 100,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    }
  ],
  
  // Um item de exemplo
  items: [
    {
      id: "item1",
      name: "Chave de Fenda Phillips",
      description: "Chave de fenda com ponta phillips, tamanho médio",
      category: { id: "cat3", name: "Ferramentas" },
      quantity: 5,
      minQuantity: 2,
      unit: "unidade",
      locationId: "loc1",
      status: ItemStatus.AVAILABLE,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    }
  ]
};

/**
 * Verifica se uma coleção já existe no Firestore
 */
async function collectionExists(collectionName: string): Promise<boolean> {
  const collectionRef = collection(db, collectionName);
  const snapshot = await getDocs(collectionRef);
  return !snapshot.empty;
}

/**
 * Inicializa uma coleção com um documento inicial se ela não existir
 */
async function initializeCollection(collectionName: string, initialItems: any[]): Promise<void> {
  try {
    const exists = await collectionExists(collectionName);
    
    if (exists) {
      console.log(`✓ Coleção '${collectionName}' já existe.`);
      return;
    }
    
    // Cria documentos iniciais
    for (const item of initialItems) {
      const { id, ...data } = item;
      const docRef = doc(db, collectionName, id);
      await setDoc(docRef, data);
    }
    
    console.log(`✓ Coleção '${collectionName}' inicializada com sucesso!`);
  } catch (error) {
    console.error(`✗ Erro ao inicializar coleção '${collectionName}':`, error);
  }
}

/**
 * Função principal para inicializar todas as coleções
 */
export async function initializeFirestore(): Promise<void> {
  console.log("🔥 Iniciando configuração do Firestore...");
  
  try {
    // Inicializa as coleções uma por uma
    await initializeCollection(COLLECTIONS.CATEGORIES, initialData.categories);
    await initializeCollection(COLLECTIONS.LOCATIONS, initialData.locations);
    await initializeCollection(COLLECTIONS.ITEMS, initialData.items);
    
    // Estas coleções podem começar vazias, apenas criamos o primeiro documento e depois o excluímos
    // Apenas para garantir que a coleção exista
    if (!await collectionExists(COLLECTIONS.MOVEMENTS)) {
      console.log(`✓ Criando coleção vazia '${COLLECTIONS.MOVEMENTS}'`);
      await setDoc(doc(db, COLLECTIONS.MOVEMENTS, "placeholder"), {
        note: "Documento temporário para criar a coleção",
        createdAt: serverTimestamp()
      });
    }
    
    if (!await collectionExists(COLLECTIONS.LOANS)) {
      console.log(`✓ Criando coleção vazia '${COLLECTIONS.LOANS}'`);
      await setDoc(doc(db, COLLECTIONS.LOANS, "placeholder"), {
        note: "Documento temporário para criar a coleção",
        createdAt: serverTimestamp()
      });
    }
    
    console.log("✅ Configuração do Firestore concluída com sucesso!");
  } catch (error) {
    console.error("❌ Erro durante a inicialização do Firestore:", error);
  }
}
