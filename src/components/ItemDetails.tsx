import { Item, Loan, Movement } from '@/types';
import { useInventory } from '@/contexts/InventoryContext';
import StatusBadge from './StatusBadge';
import { format, isValid } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, ArrowUp, ArrowDown, User, Clock } from 'lucide-react';

interface ItemDetailsProps {
  item: Item;
  onClose: () => void;
}

const ItemDetails = ({ item, onClose }: ItemDetailsProps) => {
  const { loans, movements, getLocationById } = useInventory();

  const itemLoans = loans.filter(loan => loan.item.id === item.id);
  const activeLoans = itemLoans.filter(loan => !loan.actualReturnDate);
  const completedLoans = itemLoans.filter(loan => loan.actualReturnDate);

  const itemMovements = movements.filter(movement => movement.item.id === item.id);

  // Obter o objeto de localização completo usando o ID
  const location = getLocationById(item.locationId);

  // Helper function to safely format dates
  const formatDate = (date: any): string => {
    if (!date) return 'N/A';

    if (date && typeof date === 'object' && 'toDate' in date && typeof date.toDate === 'function') {
      try {
        return format(date.toDate(), 'dd/MM/yyyy', { locale: ptBR });
      } catch (error) {
        console.error("Error converting timestamp:", error);
        return 'Data inválida';
      }
    }

    try {
      return isValid(new Date(date))
        ? format(new Date(date), 'dd/MM/yyyy', { locale: ptBR })
        : 'Data inválida';
    } catch (error) {
      console.error("Error formatting date:", error);
      return 'Data inválida';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold">{item.name}</h2>
          <div className="flex items-center gap-2 mt-1">
            <div className="text-sm text-muted-foreground">ID: {item.id}</div>
            <StatusBadge status={item.status} />
          </div>
        </div>

        <div className="text-right">
          <div className="text-2xl font-bold">{item.quantity} <span className="text-base font-normal">{item.unit}</span></div>
          <div className="text-sm text-muted-foreground">{item.category.name}</div>
        </div>
      </div>

      <div className="bg-slate-50 p-3 rounded-md">
        <h3 className="text-sm font-medium mb-1">Descrição</h3>
        <p>{item.description}</p>
      </div>

      <div className="bg-slate-50 p-3 rounded-md">
        <h3 className="text-sm font-medium mb-1">Localização</h3>
        <p>{location ? location.name : 'Localização não encontrada'}</p>
      </div>

      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <div>
          Cadastrado em: {formatDate(item.createdAt)}
        </div>
        <div>
          Última atualização: {formatDate(item.updatedAt)}
        </div>
      </div>

      <div className="pt-4">
        <Tabs defaultValue="loans">
          <TabsList className="w-full grid grid-cols-2">
            <TabsTrigger value="loans">Empréstimos</TabsTrigger>
            <TabsTrigger value="movements">Movimentações</TabsTrigger>
          </TabsList>
          <TabsContent value="loans" className="space-y-4 pt-4">
            {activeLoans.length > 0 && (
              <div className="space-y-2">
                <h3 className="font-medium flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  Empréstimos Ativos
                </h3>
                <div className="bg-status-borrowed/30 rounded-md p-3 space-y-3">
                  {activeLoans.map(loan => (
                    <div key={loan.id} className="flex justify-between items-center border-b border-amber-200 pb-2 last:border-0 last:pb-0">
                      <div>
                        <div className="font-medium">{loan.borrower.name}</div>
                        <div className="text-sm">
                          Qtd: {loan.quantity} {item.unit} | 
                          Empréstimo: {formatDate(loan.borrowDate)}
                        </div>
                        {loan.notes && (
                          <div className="text-sm text-muted-foreground">{loan.notes}</div>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">
                          Devolução esperada:
                        </div>
                        <div>
                          {formatDate(loan.expectedReturnDate)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {completedLoans.length > 0 && (
              <div className="space-y-2">
                <h3 className="font-medium flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  Empréstimos Concluídos
                </h3>
                <div className="bg-slate-100 rounded-md p-3 space-y-3">
                  {completedLoans.map(loan => (
                    <div key={loan.id} className="flex justify-between items-center border-b border-slate-200 pb-2 last:border-0 last:pb-0">
                      <div>
                        <div className="font-medium">{loan.borrower.name}</div>
                        <div className="text-sm">
                          Qtd: {loan.quantity} {item.unit} | 
                          Período: {formatDate(loan.borrowDate)} - {formatDate(loan.actualReturnDate)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {itemLoans.length === 0 && (
              <div className="text-center py-6 text-muted-foreground">
                Sem registros de empréstimos para este item.
              </div>
            )}
          </TabsContent>

          <TabsContent value="movements" className="space-y-4 pt-4">
            {itemMovements.length > 0 ? (
              <div className="bg-slate-50 rounded-md p-3 space-y-3">
                {itemMovements.map(movement => (
                  <div key={movement.id} className="flex items-start border-b border-slate-200 pb-3 last:border-0 last:pb-0">
                    <div className={`${movement.type === 'Entrada' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'} p-1.5 rounded-md mr-3`}>
                      {movement.type === 'Entrada' ? <ArrowUp className="h-5 w-5" /> : <ArrowDown className="h-5 w-5" />}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <div className="font-medium">
                          {movement.type} - {movement.reason}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {formatDate(movement.date)}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 mt-1 text-sm">
                        <User className="h-3.5 w-3.5" />
                        <span>{movement.responsibleUser.name}</span>
                      </div>
                      <div>
                        <span className="text-lg font-medium">{movement.quantity}</span> {item.unit}
                      </div>
                      {movement.notes && (
                        <div className="text-sm text-muted-foreground mt-1">{movement.notes}</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-muted-foreground">
                Sem registros de movimentações para este item.
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      <div className="flex justify-end pt-4">
        <Button onClick={onClose}>Fechar</Button>
      </div>
    </div>
  );
};

export default ItemDetails;
