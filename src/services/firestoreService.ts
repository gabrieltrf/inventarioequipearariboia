import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  Timestamp,
  serverTimestamp
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Item, Location } from "@/types";

// Collections
const LOCATIONS_COLLECTION = "locations";
const ITEMS_COLLECTION = "items";
const LOANS_COLLECTION = "loans";
const MOVEMENTS_COLLECTION = "movements";

// Helper function to remove undefined values from an object (Firestore doesn't accept undefined)
const removeUndefinedValues = (obj: any): any => {
  const result: any = {};
  
  Object.keys(obj).forEach(key => {
    if (obj[key] !== undefined) {
      // For nested objects, recursively clean them
      if (typeof obj[key] === 'object' && obj[key] !== null) {
        result[key] = removeUndefinedValues(obj[key]);
      } else {
        result[key] = obj[key];
      }
    }
    // Skip undefined values completely
  });
  
  return result;
};

// Conversão de datas para Firestore e vice-versa
const convertToFirestore = (data: any) => {
  // First, remove any undefined values
  const cleanData = removeUndefinedValues(data);
  const result = { ...cleanData };
  
  // Converte objetos Date para Timestamp do Firestore
  Object.keys(result).forEach(key => {
    if (result[key] instanceof Date) {
      result[key] = Timestamp.fromDate(result[key]);
    } else if (typeof result[key] === 'object' && result[key] !== null) {
      result[key] = convertToFirestore(result[key]);
    }
  });
  
  return result;
};

// Improve the conversion from Firestore function to better handle timestamps
const convertFromFirestore = (data: any) => {
  if (!data) return null;
  
  const result = { ...data };
  
  // Converte Timestamp do Firestore para objetos Date
  Object.keys(result).forEach(key => {
    // Check if the value is a Firestore Timestamp
    if (result[key] && typeof result[key] === 'object' && 'toDate' in result[key] && typeof result[key].toDate === 'function') {
      // Convert to JavaScript Date
      try {
        result[key] = result[key].toDate();
      } catch (error) {
        console.error(`Error converting timestamp for field ${key}:`, error);
        result[key] = null; // Set to null if conversion fails
      }
    } else if (typeof result[key] === 'object' && result[key] !== null) {
      result[key] = convertFromFirestore(result[key]);
    }
  });
  
  return result;
};

// Serviços para Locations
export const locationService = {
  async getAll(): Promise<Location[]> {
    try {
      const locationsRef = collection(db, LOCATIONS_COLLECTION);
      const snapshot = await getDocs(locationsRef);
      return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          ...convertFromFirestore(data),
          id: doc.id
        } as Location;
      });
    } catch (error) {
      console.error("Erro ao buscar localizações:", error);
      throw error;
    }
  },

  async getById(id: string): Promise<Location | null> {
    try {
      const locationRef = doc(db, LOCATIONS_COLLECTION, id);
      const snapshot = await getDoc(locationRef);
      
      if (!snapshot.exists()) {
        return null;
      }
      
      const data = snapshot.data();
      return {
        ...convertFromFirestore(data),
        id: snapshot.id
      } as Location;
    } catch (error) {
      console.error(`Erro ao buscar localização ${id}:`, error);
      throw error;
    }
  },

  async create(location: Omit<Location, 'id' | 'createdAt' | 'updatedAt'>): Promise<Location> {
    try {
      const locationsRef = collection(db, LOCATIONS_COLLECTION);
      
      // Prepare data for Firestore - handle optional fields properly
      const locationToSave = {
        name: location.name,
        description: location.description,
        // Only include capacity and responsible if they are defined and valid
        ...(location.capacity !== undefined && location.capacity !== null ? { capacity: Number(location.capacity) } : {}),
        ...(location.responsible ? { responsible: location.responsible } : {}),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      
      // Convert to proper Firestore format
      const firestoreData = convertToFirestore(locationToSave);
      
      const docRef = await addDoc(locationsRef, firestoreData);
      const newLocation = await getDoc(docRef);
      
      if (!newLocation.exists()) {
        throw new Error("Falha ao criar localização: documento não encontrado após criação");
      }
      
      return {
        ...convertFromFirestore(newLocation.data()),
        id: docRef.id
      } as Location;
    } catch (error) {
      console.error("Erro ao criar localização:", error);
      throw error;
    }
  },

  async update(id: string, data: Partial<Location>): Promise<void> {
    try {
      const locationRef = doc(db, LOCATIONS_COLLECTION, id);
      // Remove undefined values before updating
      const cleanData = removeUndefinedValues(data);
      
      const updateData = {
        ...convertToFirestore(cleanData),
        updatedAt: serverTimestamp()
      };
      
      await updateDoc(locationRef, updateData);
    } catch (error) {
      console.error(`Erro ao atualizar localização ${id}:`, error);
      throw error;
    }
  },

  async delete(id: string): Promise<void> {
    try {
      const locationRef = doc(db, LOCATIONS_COLLECTION, id);
      await deleteDoc(locationRef);
    } catch (error) {
      console.error(`Erro ao excluir localização ${id}:`, error);
      throw error;
    }
  }
};

// Serviços para Items
export const itemService = {
  async getAll(): Promise<Item[]> {
    try {
      const itemsRef = collection(db, ITEMS_COLLECTION);
      const snapshot = await getDocs(itemsRef);
      return Promise.all(snapshot.docs.map(async (docSnapshot) => {
        const data = docSnapshot.data();
        
        const item = {
          ...convertFromFirestore(data),
          id: docSnapshot.id,
        } as Item;
        
        return item;
      }));
    } catch (error) {
      console.error("Erro ao buscar itens:", error);
      throw error;
    }
  },

  async getById(id: string): Promise<Item | null> {
    try {
      const itemRef = doc(db, ITEMS_COLLECTION, id);
      const snapshot = await getDoc(itemRef);
      
      if (!snapshot.exists()) {
        return null;
      }
      
      const data = snapshot.data();
      return {
        ...convertFromFirestore(data),
        id: snapshot.id
      } as Item;
    } catch (error) {
      console.error(`Erro ao buscar item ${id}:`, error);
      throw error;
    }
  },

  async getByLocationId(locationId: string): Promise<Item[]> {
    try {
      const itemsRef = collection(db, ITEMS_COLLECTION);
      const q = query(itemsRef, where("locationId", "==", locationId));
      const snapshot = await getDocs(q);
      
      return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          ...convertFromFirestore(data),
          id: doc.id
        } as Item;
      });
    } catch (error) {
      console.error(`Erro ao buscar itens da localização ${locationId}:`, error);
      throw error;
    }
  },

  async create(item: Omit<Item, 'id' | 'createdAt' | 'updatedAt'>): Promise<Item> {
    try {
      const itemsRef = collection(db, ITEMS_COLLECTION);
      
      // Clean and prepare the item data for Firestore
      const sanitizedItem = removeUndefinedValues(item);
      const itemToSave = {
        ...sanitizedItem,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      
      const docRef = await addDoc(itemsRef, convertToFirestore(itemToSave));
      const newItem = await getDoc(docRef);
      
      return {
        ...convertFromFirestore(newItem.data() as any),
        id: docRef.id
      } as Item;
    } catch (error) {
      console.error("Erro ao criar item:", error);
      throw error;
    }
  },

  async update(id: string, data: Partial<Item>): Promise<void> {
    try {
      const itemRef = doc(db, ITEMS_COLLECTION, id);
      const cleanData = removeUndefinedValues(data);
      
      const updateData = {
        ...convertToFirestore(cleanData),
        updatedAt: serverTimestamp()
      };
      
      await updateDoc(itemRef, updateData);
    } catch (error) {
      console.error(`Erro ao atualizar item ${id}:`, error);
      throw error;
    }
  },

  async delete(id: string): Promise<void> {
    try {
      const itemRef = doc(db, ITEMS_COLLECTION, id);
      await deleteDoc(itemRef);
    } catch (error) {
      console.error(`Erro ao excluir item ${id}:`, error);
      throw error;
    }
  }
};
