
import React from 'react';
import { useNotifications } from '@/contexts/NotificationsContext';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Bell, CheckCircle2, AlertCircle, ArrowRight, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';

const Notifications = () => {
  const { notifications, markAsRead, markAllAsRead } = useNotifications();

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'emprestimo':
        return <ArrowRight className="h-5 w-5 text-blue-500" />;
      case 'devolucao_atrasada':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case 'estoque_baixo':
        return <Package className="h-5 w-5 text-amber-500" />;
      case 'movimentacao':
        return <ArrowRight className="h-5 w-5 text-green-500" />;
      default:
        return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'emprestimo':
        return 'border-l-4 border-l-blue-500';
      case 'devolucao_atrasada':
        return 'border-l-4 border-l-red-500';
      case 'estoque_baixo':
        return 'border-l-4 border-l-amber-500';
      case 'movimentacao':
        return 'border-l-4 border-l-green-500';
      default:
        return 'border-l-4 border-l-gray-500';
    }
  };

  return (
    <div className="container py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Notificações</h1>
        <Button variant="outline" onClick={markAllAsRead}>
          Marcar todas como lidas
        </Button>
      </div>

      {notifications.length === 0 ? (
        <div className="text-center py-10">
          <Bell className="mx-auto h-10 w-10 text-muted-foreground" />
          <h2 className="mt-2 text-xl font-semibold">Sem notificações</h2>
          <p className="text-muted-foreground">
            Você não tem nenhuma notificação no momento.
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {notifications.map((notification) => (
            <Card 
              key={notification.id} 
              className={`${getNotificationColor(notification.type)} ${!notification.read ? 'bg-accent/10' : ''}`}
            >
              <CardHeader className="py-3">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-base font-medium flex items-center gap-2">
                    {getNotificationIcon(notification.type)}
                    {notification.title}
                    {!notification.read && (
                      <Badge variant="secondary" className="ml-2">
                        Nova
                      </Badge>
                    )}
                  </CardTitle>
                  <span className="text-xs text-muted-foreground">
                    {format(notification.date, 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="py-2">
                <p>{notification.message}</p>
              </CardContent>
              <CardFooter className="py-2 flex justify-end gap-2">
                {!notification.read && (
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => markAsRead(notification.id)}
                  >
                    <CheckCircle2 className="h-4 w-4 mr-1" />
                    Marcar como lida
                  </Button>
                )}
                {notification.actionLink && (
                  <Button variant="secondary" size="sm" asChild>
                    <Link to={notification.actionLink}>
                      Ver detalhes
                    </Link>
                  </Button>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Notifications;
