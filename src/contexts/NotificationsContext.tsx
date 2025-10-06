import React, { createContext, useContext, useState, useEffect } from 'react';
import { useInventory } from './InventoryContext';
import { Notification } from './InventoryContextExtension';

export interface NotificationsContextType {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  addNotification: (notification: Omit<Notification, 'id' | 'date' | 'read'>) => void;
  removeNotificationsByTypeAndItemId: (type: string, itemId: string) => void;
}

const NotificationsContext = createContext<NotificationsContextType | null>(null);

export const NotificationsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const { items, loans } = useInventory();
  
  // Calcula contagem de não lidas
  const unreadCount = notifications.filter(n => !n.read).length;

  // Marcar notificação como lida
  const markAsRead = (id: string) => {
    setNotifications(prevNotifications =>
      prevNotifications.map(notification =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  };

  // Marcar todas como lidas
  const markAllAsRead = () => {
    setNotifications(prevNotifications =>
      prevNotifications.map(notification => ({ ...notification, read: true }))
    );
  };

  // Adicionar nova notificação
  const addNotification = (notification: Omit<Notification, 'id' | 'date' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: `notification-${Date.now()}`,
      date: new Date(),
      read: false
    };
    
    setNotifications(prev => [newNotification, ...prev]);
  };

  // Nova função para remover notificações por tipo e itemId
  const removeNotificationsByTypeAndItemId = (type: string, itemId: string) => {
    setNotifications(prev => 
      prev.filter(notification => 
        !(notification.type === type && notification.itemId === itemId)
      )
    );
  };

  // Verificar empréstimos vencidos e níveis de estoque
  useEffect(() => {
    const today = new Date();
    
    // Verificar empréstimos vencidos
    loans.forEach(loan => {
      if (!loan.actualReturnDate && new Date(loan.expectedReturnDate) < today) {
        // Verificar se já existe notificação para este empréstimo
        const notificationExists = notifications.some(
          n => n.type === 'devolucao_atrasada' && n.itemId === loan.id
        );
        
        if (!notificationExists) {
          addNotification({
            type: 'devolucao_atrasada',
            title: 'Devolução atrasada',
            itemName: loan.item.name,
            itemId: loan.id,
            message: `O empréstimo de ${loan.item.name} para ${loan.borrower.name} está atrasado.`,
            actionLink: '/emprestimos'
          });
        }
      }
    });
    
    // Verificar níveis baixos de estoque
    items.forEach(item => {
      // Verificar se o item está com estoque baixo
      if (item.quantity <= item.minQuantity) {
        // Verificar se já existe notificação para este item
        const notificationExists = notifications.some(
          n => n.type === 'estoque_baixo' && n.itemId === item.id
        );
        
        if (!notificationExists) {
          addNotification({
            type: 'estoque_baixo',
            title: 'Estoque baixo',
            itemName: item.name,
            itemId: item.id,
            message: `O item ${item.name} está com estoque baixo (${item.quantity} ${item.unit}).`,
            actionLink: '/'
          });
        }
      } else {
        // Se o item NÃO está com estoque baixo, remover notificações relacionadas
        const hasNotification = notifications.some(
          n => n.type === 'estoque_baixo' && n.itemId === item.id
        );
        
        if (hasNotification) {
          removeNotificationsByTypeAndItemId('estoque_baixo', item.id);
        }
      }
    });
  }, [items, loans, notifications]);

  // Adiciona algumas notificações de exemplo na primeira renderização
  useEffect(() => {
    if (notifications.length === 0) {
      const exampleNotifications: Omit<Notification, 'id' | 'date' | 'read'>[] = [
        {
          type: 'sistema',
          title: 'Bem-vindo ao Inventário Fácil',
          message: 'Sistema inicializado com sucesso. Todas as funcionalidades estão disponíveis.'
        },
        {
          type: 'movimentacao',
          title: 'Novas ferramentas adicionadas',
          message: 'Um lote de 10 novas ferramentas foi adicionado ao sistema.'
        }
      ];
      
      exampleNotifications.forEach(addNotification);
    }
  }, []);

  const contextValue: NotificationsContextType = {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    addNotification,
    removeNotificationsByTypeAndItemId
  };

  return (
    <NotificationsContext.Provider value={contextValue}>
      {children}
    </NotificationsContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationsContext);
  if (!context) {
    throw new Error('useNotifications deve ser usado dentro de um NotificationsProvider');
  }
  return context;
};
