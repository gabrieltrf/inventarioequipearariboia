
import { useState } from 'react';
import { useInventory } from '@/contexts/InventoryContext';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format, isAfter } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import StatusBadge from '@/components/StatusBadge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ItemStatus } from '@/types';
import { UserRole } from '@/types';
import { Clock, CheckCircle, AlertTriangle } from 'lucide-react';

const Loans = () => {
  const { loans, items, returnLoan, currentUser } = useInventory();
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [selectedLoanId, setSelectedLoanId] = useState<string | null>(null);
  
  const activeLoans = loans.filter(loan => !loan.actualReturnDate);
  const historyLoans = loans.filter(loan => loan.actualReturnDate);
  
  const handleReturnLoan = (loanId: string) => {
    setSelectedLoanId(loanId);
    setConfirmDialogOpen(true);
  };
  
  const confirmReturnLoan = () => {
    if (selectedLoanId) {
      returnLoan(selectedLoanId);
      setConfirmDialogOpen(false);
      setSelectedLoanId(null);
    }
  };
  
  const isOverdue = (expectedDate: Date): boolean => {
    return isAfter(new Date(), expectedDate);
  };

  return (
    <div className="container mx-auto px-4 py-4 max-w-7xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Empréstimos</h1>
      </div>
      
      <div className="mb-8">
        <div className="flex items-center mb-4">
          <Clock className="mr-2 h-5 w-5 text-amber-600" />
          <h2 className="text-xl font-medium">Empréstimos Ativos</h2>
        </div>
        
        <div className="rounded-md border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item</TableHead>
                <TableHead>Responsável</TableHead>
                <TableHead className="text-center">Quantidade</TableHead>
                <TableHead>Data do Empréstimo</TableHead>
                <TableHead>Devolução Prevista</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {activeLoans.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">
                    Não há empréstimos ativos no momento.
                  </TableCell>
                </TableRow>
              ) : (
                activeLoans.map((loan) => {
                  const isLate = isOverdue(loan.expectedReturnDate);
                  
                  return (
                    <TableRow key={loan.id} className={isLate ? 'bg-red-50' : ''}>
                      <TableCell className="font-medium">
                        {loan.item.name} <span className="text-xs text-muted-foreground">({loan.item.id})</span>
                      </TableCell>
                      <TableCell>{loan.borrower.name}</TableCell>
                      <TableCell className="text-center">{loan.quantity} {loan.item.unit}</TableCell>
                      <TableCell>{format(loan.borrowDate, "dd/MM/yyyy", { locale: ptBR })}</TableCell>
                      <TableCell>{format(loan.expectedReturnDate, "dd/MM/yyyy", { locale: ptBR })}</TableCell>
                      <TableCell>
                        {isLate ? (
                          <div className="flex items-center">
                            <AlertTriangle className="h-4 w-4 text-destructive mr-1" />
                            <span className="text-destructive text-xs">Atrasado</span>
                          </div>
                        ) : (
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 text-amber-500 mr-1" />
                            <span className="text-amber-500 text-xs">Em andamento</span>
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleReturnLoan(loan.id)}
                          disabled={currentUser.role !== UserRole.ADMIN && 
                                    currentUser.id !== loan.borrower.id}
                        >
                          Devolver
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>
      
      <div>
        <div className="flex items-center mb-4">
          <CheckCircle className="mr-2 h-5 w-5 text-muted-foreground" />
          <h2 className="text-xl font-medium">Histórico de Empréstimos</h2>
        </div>
        
        <div className="rounded-md border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item</TableHead>
                <TableHead>Responsável</TableHead>
                <TableHead className="text-center">Quantidade</TableHead>
                <TableHead>Data do Empréstimo</TableHead>
                <TableHead>Data da Devolução</TableHead>
                <TableHead>Duração</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {historyLoans.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    Não há histórico de empréstimos.
                  </TableCell>
                </TableRow>
              ) : (
                historyLoans.map((loan) => {
                  const duration = Math.ceil(
                    (loan.actualReturnDate!.getTime() - loan.borrowDate.getTime()) / 
                    (1000 * 60 * 60 * 24)
                  );
                  
                  return (
                    <TableRow key={loan.id}>
                      <TableCell className="font-medium">
                        {loan.item.name} <span className="text-xs text-muted-foreground">({loan.item.id})</span>
                      </TableCell>
                      <TableCell>{loan.borrower.name}</TableCell>
                      <TableCell className="text-center">{loan.quantity} {loan.item.unit}</TableCell>
                      <TableCell>{format(loan.borrowDate, "dd/MM/yyyy", { locale: ptBR })}</TableCell>
                      <TableCell>{format(loan.actualReturnDate!, "dd/MM/yyyy", { locale: ptBR })}</TableCell>
                      <TableCell>{duration} {duration === 1 ? 'dia' : 'dias'}</TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>
      
      {/* Diálogo de confirmação para devolução */}
      <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Devolução</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>Tem certeza que deseja registrar a devolução deste item?</p>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setConfirmDialogOpen(false)}>Cancelar</Button>
            <Button onClick={confirmReturnLoan}>Confirmar Devolução</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Loans;
