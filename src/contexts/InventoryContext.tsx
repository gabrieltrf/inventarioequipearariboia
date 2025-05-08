import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  categories as initialCategories, 
  items as initialItemsMock, 
  loans as initialLoans, 
  movements as initialMovements, 
  currentUser, 
  users, 
} from '@/data/mockData';
import { 
  Item, 
  Loan, 
  Movement, 
  ItemStatus, 
  MovementType, 
  MovementReason, 
  User, 
  UserRole, 
  Location 
} from '@/types';
import { toast } from 'sonner';
import { Notification } from './InventoryContextExtension';
import { locationService, itemService } from '@/services/firestoreService';

interface InventoryContextType {
  items: Item[];
  loans: Loan[];
  movements: Movement[];
  categories: { id: string; name: string }[];
  users: User[];
  locations: Location[];
  currentUser: User;
  notifications?: Notification[];
  loadingItems: boolean;
  loadingLocations: boolean;
  addItem: (item: Omit<Item, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateItem: (id: string, data: Partial<Item>) => Promise<void>;
  deleteItem: (id: string) => Promise<void>;
  addMovement: (movement: Omit<Movement, 'id' | 'date'>) => void;
  addLoan: (loan: Omit<Loan, 'id'>) => void;
  returnLoan: (loanId: string) => void;
  switchViewMode: () => void;
  isCardView: boolean;
  setUser: (userId: string) => void;
  searchItems: (query: string) => Item[];
  filterItemsByStatus: (status: ItemStatus | null) => Item[];
  addLocation: (location: Omit<Location, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateLocation: (id: string, data: Partial<Location>) => Promise<void>;
  deleteLocation: (id: string) => Promise<void>;
  getItemsByLocation: (locationId: string) => Item[];
  getLocationById: (id: string) => Location | undefined;
  refreshItems: () => Promise<void>;
  refreshLocations: () => Promise<void>;
}

const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

export const InventoryProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [items, setItems] = useState<Item[]>([]);
  const [loans, setLoans] = useState<Loan[]>(initialLoans);
  const [movements, setMovements] = useState<Movement[]>(initialMovements);
  const [locations, setLocations] = useState<Location[]>([]);
  const [isCardView, setIsCardView] = useState(false);
  const [user, setUser] = useState<User>(currentUser);
  const [loadingItems, setLoadingItems] = useState(true);
  const [loadingLocations, setLoadingLocations] = useState(true);

  useEffect(() => {
    refreshLocations();
    refreshItems();
  }, []);

  const refreshLocations = async (): Promise<void> => {
    try {
      setLoadingLocations(true);
      const locationsData = await locationService.getAll();
      setLocations(locationsData);
    } catch (error) {
      console.error("Erro ao carregar localizações:", error);
      toast.error("Erro ao carregar localizações");
    } finally {
      setLoadingLocations(false);
    }
  };

  const refreshItems = async (): Promise<void> => {
    try {
      setLoadingItems(true);
      const itemsData = await itemService.getAll();
      setItems(itemsData);
    } catch (error) {
      console.error("Erro ao carregar itens:", error);
      toast.error("Erro ao carregar itens");
    } finally {
      setLoadingItems(false);
    }
  };

  const addItem = async (item: Omit<Item, 'id' | 'createdAt' | 'updatedAt'>): Promise<void> => {
    try {
      await itemService.create(item);
      toast.success(`Item "${item.name}" adicionado com sucesso!`);
      await refreshItems();
    } catch (error) {
      console.error("Erro ao adicionar item:", error);
      toast.error("Erro ao adicionar item");
    }
  };

  const updateItem = async (id: string, data: Partial<Item>): Promise<void> => {
    try {
      await itemService.update(id, data);
      toast.success('Item atualizado com sucesso!');
      await refreshItems();
    } catch (error) {
      console.error("Erro ao atualizar item:", error);
      toast.error("Erro ao atualizar item");
    }
  };

  const deleteItem = async (id: string): Promise<void> => {
    const hasActiveLoans = loans.some(loan => 
      loan.item.id === id && !loan.actualReturnDate
    );
    
    if (hasActiveLoans) {
      toast.error('Não é possível excluir item com empréstimos ativos.');
      return;
    }
    
    try {
      const item = items.find(i => i.id === id);
      await itemService.delete(id);
      await refreshItems();
      
      if (item) {
        toast.success(`Item "${item.name}" excluído com sucesso!`);
      }
    } catch (error) {
      console.error("Erro ao excluir item:", error);
      toast.error("Erro ao excluir item");
    }
  };

  const addLocation = async (location: Omit<Location, 'id' | 'createdAt' | 'updatedAt'>): Promise<void> => {
    try {
      // Ensure we're sending data without undefined values
      const locationData = {
        name: location.name,
        description: location.description,
        // Only include these fields if they are defined
        ...(location.capacity !== undefined && location.capacity !== null 
            ? { capacity: Number(location.capacity) } 
            : {}),
        ...(location.responsible && location.responsible.trim() !== '' 
            ? { responsible: location.responsible } 
            : {})
      };
      
      await locationService.create(locationData);
      toast.success(`Localização "${location.name}" adicionada com sucesso!`);
      await refreshLocations();
    } catch (error) {
      console.error("Erro ao adicionar localização:", error);
      toast.error("Erro ao adicionar localização");
    }
  };

  const updateLocation = async (id: string, data: Partial<Location>): Promise<void> => {
    try {
      await locationService.update(id, data);
      toast.success('Localização atualizada com sucesso!');
      await refreshLocations();
    } catch (error) {
      console.error("Erro ao atualizar localização:", error);
      toast.error("Erro ao atualizar localização");
    }
  };

  const deleteLocation = async (id: string): Promise<void> => {
    const hasItems = items.some(item => item.locationId === id);
    
    if (hasItems) {
      toast.error('Não é possível excluir uma localização que possui itens.');
      return;
    }
    
    try {
      const location = locations.find(loc => loc.id === id);
      await locationService.delete(id);
      await refreshLocations();
      
      if (location) {
        toast.success(`Localização "${location.name}" excluída com sucesso!`);
      }
    } catch (error) {
      console.error("Erro ao excluir localização:", error);
      toast.error("Erro ao excluir localização");
    }
  };

  const addMovement = (movement: Omit<Movement, 'id' | 'date'>) => {
    const newMovement: Movement = {
      ...movement,
      id: Math.random().toString(36).substr(2, 9),
      date: new Date(),
    };
    
    const item = items.find(i => i.id === movement.item.id);
    if (item) {
      const newQuantity = movement.type === MovementType.INPUT 
        ? item.quantity + movement.quantity 
        : item.quantity - movement.quantity;
        
      if (newQuantity < 0) {
        toast.error('Quantidade insuficiente em estoque.');
        return;
      }
      
      updateItem(item.id, { quantity: newQuantity });
    }
    
    setMovements(prev => [...prev, newMovement]);
    toast.success('Movimentação registrada com sucesso!');
  };

  const addLoan = (loan: Omit<Loan, 'id'>) => {
    const item = items.find(i => i.id === loan.item.id);
    if (!item) {
      toast.error('Item não encontrado.');
      return;
    }
    
    if (item.quantity < loan.quantity) {
      toast.error('Quantidade insuficiente em estoque.');
      return;
    }
    
    const newLoan: Loan = {
      ...loan,
      id: Math.random().toString(36).substr(2, 9),
    };
    
    const newQuantity = item.quantity - loan.quantity;
    const newStatus = newQuantity === 0 ? ItemStatus.BORROWED : item.status;
    updateItem(item.id, { quantity: newQuantity, status: newStatus });
    
    addMovement({
      item: loan.item,
      type: MovementType.OUTPUT,
      reason: MovementReason.USE,
      quantity: loan.quantity,
      responsibleUser: loan.borrower,
      notes: `Empréstimo para ${loan.borrower.name}`,
    });
    
    setLoans(prev => [...prev, newLoan]);
    toast.success('Empréstimo registrado com sucesso!');
  };

  const returnLoan = (loanId: string) => {
    const loan = loans.find(l => l.id === loanId);
    if (!loan || loan.actualReturnDate) {
      toast.error('Empréstimo não encontrado ou já devolvido.');
      return;
    }
    
    const updatedLoan = {...loan, actualReturnDate: new Date()};
    setLoans(prev => 
      prev.map(l => l.id === loanId ? updatedLoan : l)
    );
    
    const item = items.find(i => i.id === loan.item.id);
    if (item) {
      const newQuantity = item.quantity + loan.quantity;
      updateItem(item.id, {
        quantity: newQuantity,
        status: newQuantity > 0 ? ItemStatus.AVAILABLE : item.status
      });
      
      addMovement({
        item: loan.item,
        type: MovementType.INPUT,
        reason: MovementReason.OTHER,
        quantity: loan.quantity,
        responsibleUser: user,
        notes: `Devolução do empréstimo por ${loan.borrower.name}`,
      });
      
      toast.success('Item devolvido com sucesso!');
    }
  };

  const switchViewMode = () => {
    setIsCardView(prev => !prev);
  };

  const setCurrentUser = (userId: string) => {
    const selectedUser = users.find(u => u.id === userId);
    if (selectedUser) {
      setUser(selectedUser);
      return true;
    }
    return false;
  };

  const searchItems = (query: string): Item[] => {
    if (!query.trim()) return items;
    
    const lowerQuery = query.toLowerCase();
    return items.filter(item => 
      item.name.toLowerCase().includes(lowerQuery) ||
      item.id.toLowerCase().includes(lowerQuery) ||
      item.description.toLowerCase().includes(lowerQuery) ||
      item.category.name.toLowerCase().includes(lowerQuery) ||
      item.locationId.toLowerCase().includes(lowerQuery)
    );
  };

  const filterItemsByStatus = (status: ItemStatus | null): Item[] => {
    if (!status) return items;
    return items.filter(item => item.status === status);
  };

  const getItemsByLocation = (locationId: string): Item[] => {
    return items.filter(item => item.locationId === locationId);
  };

  const getLocationById = (id: string): Location | undefined => {
    return locations.find(location => location.id === id);
  };

  return (
    <InventoryContext.Provider value={{
      items,
      loans,
      movements,
      categories: initialCategories,
      users,
      locations,
      currentUser: user,
      loadingItems,
      loadingLocations,
      addItem,
      updateItem,
      deleteItem,
      addMovement,
      addLoan,
      returnLoan,
      switchViewMode,
      isCardView,
      setUser: setCurrentUser,
      searchItems,
      filterItemsByStatus,
      addLocation,
      updateLocation,
      deleteLocation,
      getItemsByLocation,
      getLocationById,
      refreshItems,
      refreshLocations
    }}>
      {children}
    </InventoryContext.Provider>
  );
};

export const useInventory = (): InventoryContextType => {
  const context = useContext(InventoryContext);
  if (!context) {
    throw new Error('useInventory must be used within an InventoryProvider');
  }
  return context;
};
