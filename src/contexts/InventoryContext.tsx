
import React, { createContext, useContext, useState } from 'react';
import { categories, items as initialItems, loans as initialLoans, movements as initialMovements, currentUser, users } from '@/data/mockData';
import { Item, Loan, Movement, ItemStatus, MovementType, MovementReason, User, UserRole } from '@/types';
import { toast } from 'sonner';
import { Notification } from './InventoryContextExtension';

interface InventoryContextType {
  items: Item[];
  loans: Loan[];
  movements: Movement[];
  categories: { id: string; name: string }[];
  users: User[];
  currentUser: User;
  notifications?: Notification[];
  addItem: (item: Omit<Item, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateItem: (id: string, data: Partial<Item>) => void;
  deleteItem: (id: string) => void;
  addMovement: (movement: Omit<Movement, 'id' | 'date'>) => void;
  addLoan: (loan: Omit<Loan, 'id'>) => void;
  returnLoan: (loanId: string) => void;
  switchViewMode: () => void;
  isCardView: boolean;
  setUser: (userId: string) => void;
  searchItems: (query: string) => Item[];
  filterItemsByStatus: (status: ItemStatus | null) => Item[];
}

const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

export const InventoryProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [items, setItems] = useState<Item[]>(initialItems);
  const [loans, setLoans] = useState<Loan[]>(initialLoans);
  const [movements, setMovements] = useState<Movement[]>(initialMovements);
  const [isCardView, setIsCardView] = useState(false);
  const [user, setUser] = useState<User>(currentUser);

  const addItem = (item: Omit<Item, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newItem: Item = {
      ...item,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    setItems(prev => [...prev, newItem]);
    toast.success(`Item "${newItem.name}" adicionado com sucesso!`);
  };

  const updateItem = (id: string, data: Partial<Item>) => {
    setItems(prev => 
      prev.map(item => 
        item.id === id 
          ? { ...item, ...data, updatedAt: new Date() } 
          : item
      )
    );
    toast.success('Item atualizado com sucesso!');
  };

  const deleteItem = (id: string) => {
    // Verificar se item está emprestado
    const hasActiveLoans = loans.some(loan => 
      loan.item.id === id && !loan.actualReturnDate
    );
    
    if (hasActiveLoans) {
      toast.error('Não é possível excluir item com empréstimos ativos.');
      return;
    }
    
    const item = items.find(i => i.id === id);
    setItems(prev => prev.filter(item => item.id !== id));
    
    if (item) {
      toast.success(`Item "${item.name}" excluído com sucesso!`);
    }
  };

  const addMovement = (movement: Omit<Movement, 'id' | 'date'>) => {
    const newMovement: Movement = {
      ...movement,
      id: Math.random().toString(36).substr(2, 9),
      date: new Date(),
    };
    
    // Atualizar quantidade do item
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
    // Verificar disponibilidade
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
    
    // Atualizar quantidade e status do item
    const newQuantity = item.quantity - loan.quantity;
    const newStatus = newQuantity === 0 ? ItemStatus.BORROWED : item.status;
    updateItem(item.id, { quantity: newQuantity, status: newStatus });
    
    // Registrar movimentação
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
    
    // Atualizar empréstimo
    const updatedLoan = {...loan, actualReturnDate: new Date()};
    setLoans(prev => 
      prev.map(l => l.id === loanId ? updatedLoan : l)
    );
    
    // Atualizar quantidade do item
    const item = items.find(i => i.id === loan.item.id);
    if (item) {
      const newQuantity = item.quantity + loan.quantity;
      updateItem(item.id, {
        quantity: newQuantity,
        status: newQuantity > 0 ? ItemStatus.AVAILABLE : item.status
      });
      
      // Registrar movimentação
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
      item.location.toLowerCase().includes(lowerQuery)
    );
  };

  const filterItemsByStatus = (status: ItemStatus | null): Item[] => {
    if (!status) return items;
    return items.filter(item => item.status === status);
  };

  return (
    <InventoryContext.Provider value={{
      items,
      loans,
      movements,
      categories,
      users,
      currentUser: user,
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
      filterItemsByStatus
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
