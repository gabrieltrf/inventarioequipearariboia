
import { useState } from 'react';
import { useInventory } from '@/contexts/InventoryContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { Bell, CheckCircle, Calendar, AlertTriangle, Package, ArrowRightLeft, Info } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const Notifications = () => {
  const { notifications, markNotificationAsRead, markAllNotificationsAsRead } = useInventory();
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'emprestimo':
        return <Calendar className="h-5 w-5 text-blue-500" aria-hidden="true" />;
      case 'devolucao_atrasada':
        return <AlertTriangle className="h-5 w-5 text-destructive" aria-hidden="true" />;
      case 'estoque_baixo':
        return <Package className="h-5 w-5 text-amber-500" aria-hidden="true" />;
      case 'movimentacao':
        return <ArrowRightLeft className="h-5 w-5 text-green-500" aria-hidden="true" />;
      default:
        return <Info className="h-5 w-5 text-blue-500" aria-hidden="true" />;
    }
  };

  const filteredNotifications = notifications?.filter(notification => 
    filter === 'all' || (filter === 'unread' && !notification.read)
  ) || [];

  const unreadCount = notifications?.filter(n => !n.read).length || 0;

  return (
    <div className="container mx-auto px-4 py-4 max-w-4xl">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <Bell className="h-6 w-6" aria-hidden="true" />
          <h1 className="text-2xl font-bold">Notificações</h1>
          {unreadCount > 0 && (
            <Badge variant="destructive" className="ml-2">{unreadCount} não lidas</Badge>
          )}
        </div>
        <div className="flex gap-2 mt-4 md:mt-0">
          <Button 
            variant={filter === 'all' ? 'default' : 'outline'} 
            onClick={() => setFilter('all')}
            aria-pressed={filter === 'all'}
          >
            Todas
          </Button>
          <Button 
            variant={filter === 'unread' ? 'default' : 'outline'} 
            onClick={() => setFilter('unread')}
            aria-pressed={filter === 'unread'}
          >
            Não lidas
          </Button>
          <Button 
            variant="outline" 
            onClick={markAllNotificationsAsRead}
            disabled={unreadCount === 0}
            aria-label="Marcar todas como lidas"
          >
            <CheckCircle className="h-4 w-4 mr-1" aria-hidden="true" /> Marcar todas como lidas
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        {filteredNotifications.length > 0 ? (
          filteredNotifications.map((notification) => (
            <Card 
              key={notification.id} 
              className={`transition-colors ${!notification.read ? 'bg-muted/50 border-l-4 border-l-primary' : ''}`}
            >
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    {getNotificationIcon(notification.type)}
                    <CardTitle className="text-base">{notification.title}</CardTitle>
                  </div>
                  <Badge variant="outline">
                    {formatDistanceToNow(notification.date, { addSuffix: true, locale: ptBR })}
                  </Badge>
                </div>
                <CardDescription>{notification.itemName}</CardDescription>
              </CardHeader>
              <CardContent>
                <p>{notification.message}</p>
              </CardContent>
              <CardFooter>
                {!notification.read ? (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => markNotificationAsRead(notification.id)}
                    aria-label="Marcar como lida"
                  >
                    <CheckCircle className="h-4 w-4 mr-1" aria-hidden="true" /> Marcar como lida
                  </Button>
                ) : (
                  <Badge variant="outline" className="bg-muted/30">Lida</Badge>
                )}
                {notification.actionLink && (
                  <Button 
                    variant="link" 
                    asChild 
                    className="ml-auto"
                    aria-label={`Ver detalhes de ${notification.itemName}`}
                  >
                    <a href={notification.actionLink}>Ver detalhes</a>
                  </Button>
                )}
              </CardFooter>
            </Card>
          ))
        ) : (
          <div className="text-center py-12 border rounded-lg bg-muted/20">
            <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-3" aria-hidden="true" />
            <h2 className="text-xl font-medium mb-1">Sem notificações</h2>
            <p className="text-muted-foreground">
              {filter === 'all' 
                ? 'Você não tem notificações no momento.' 
                : 'Você não tem notificações não lidas no momento.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;
