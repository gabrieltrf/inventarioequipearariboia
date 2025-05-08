
import { useInventory } from '@/contexts/InventoryContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import StatusBadge from '@/components/StatusBadge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { format, isAfter } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { AlertTriangle, Clock, Package, FileText, ArrowRightLeft } from 'lucide-react';
import { Loan, ItemStatus } from '@/types';

const Reports = () => {
  const { items, loans, movements } = useInventory();
  
  // Estatísticas
  const totalItems = items.reduce((total, item) => total + item.quantity, 0);
  const uniqueItems = items.length;
  const lowStockItems = items.filter(item => item.quantity < 3);
  const damagedItems = items.filter(item => item.status === ItemStatus.DAMAGED);
  const activeLoans = loans.filter(loan => !loan.actualReturnDate);
  
  // Empréstimos atrasados
  const overdueLoans = activeLoans.filter(loan => 
    isAfter(new Date(), loan.expectedReturnDate)
  );
  
  // Movimentações recentes (últimos 30 dias)
  const recentDate = new Date();
  recentDate.setDate(recentDate.getDate() - 30);
  
  const recentMovements = movements.filter(movement => 
    isAfter(movement.date, recentDate)
  );
  
  // Função para gerar "PDF"
  const generatePDF = () => {
    alert("Esta funcionalidade exportaria os dados para PDF em um sistema real.");
  };
  
  // Função para exportar para CSV
  const exportToCSV = () => {
    alert("Esta funcionalidade exportaria os dados para CSV/Excel em um sistema real.");
  };

  return (
    <div className="container mx-auto px-4 py-4 max-w-7xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Relatórios e Alertas</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={generatePDF}>
            <FileText className="h-4 w-4 mr-2" />
            Exportar para PDF
          </Button>
          <Button variant="outline" onClick={exportToCSV}>
            <FileText className="h-4 w-4 mr-2" />
            Exportar para CSV
          </Button>
        </div>
      </div>
      
      {/* Cards com estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total de Itens
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalItems}</div>
            <p className="text-xs text-muted-foreground mt-1">Em {uniqueItems} tipos de itens diferentes</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Itens com Estoque Baixo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{lowStockItems.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Itens com menos de 3 unidades</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Empréstimos Ativos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{activeLoans.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {overdueLoans.length > 0 && (
                <span className="text-destructive">{overdueLoans.length} atrasados</span>
              )}
              {overdueLoans.length === 0 && 'Todos em dia'}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Itens Danificados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{damagedItems.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Necessitando reparo ou descarte</p>
          </CardContent>
        </Card>
      </div>
      
      {/* Alertas */}
      <div className="mb-8">
        <h2 className="text-xl font-medium mb-4 flex items-center">
          <AlertTriangle className="mr-2 h-5 w-5 text-amber-500" />
          Alertas
        </h2>
        
        <div className="space-y-4">
          {/* Alerta de empréstimos atrasados */}
          {overdueLoans.length > 0 && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Empréstimos Atrasados</AlertTitle>
              <AlertDescription>
                <p className="mb-2">Há {overdueLoans.length} empréstimos com devolução atrasada.</p>
                <ul className="list-disc pl-5 space-y-1">
                  {overdueLoans.map((loan: Loan) => (
                    <li key={loan.id}>
                      <strong>{loan.item.name}</strong> emprestado para <strong>{loan.borrower.name}</strong>
                      <div className="text-xs">
                        Devolução prevista: {format(loan.expectedReturnDate, "dd/MM/yyyy", { locale: ptBR })}
                      </div>
                    </li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}
          
          {/* Alerta de itens com estoque baixo */}
          {lowStockItems.length > 0 && (
            <Alert>
              <Package className="h-4 w-4" />
              <AlertTitle>Estoque Baixo</AlertTitle>
              <AlertDescription>
                <p className="mb-2">Há {lowStockItems.length} itens com estoque abaixo do mínimo recomendado (3 unidades):</p>
                <ul className="list-disc pl-5 space-y-1">
                  {lowStockItems.map(item => (
                    <li key={item.id}>
                      <strong>{item.name}</strong>: {item.quantity} {item.unit} disponíveis
                    </li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}
          
          {/* Alerta de itens danificados */}
          {damagedItems.length > 0 && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Itens Danificados</AlertTitle>
              <AlertDescription>
                <p className="mb-2">Há {damagedItems.length} itens registrados como danificados:</p>
                <ul className="list-disc pl-5 space-y-1">
                  {damagedItems.map(item => (
                    <li key={item.id}>
                      <strong>{item.name}</strong> - Localização: {item.location}
                    </li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}
          
          {/* Quando não há alertas */}
          {overdueLoans.length === 0 && lowStockItems.length === 0 && damagedItems.length === 0 && (
            <div className="bg-green-50 text-green-700 p-4 rounded-md">
              Não há alertas ativos no momento. Todos os indicadores estão normais.
            </div>
          )}
        </div>
      </div>
      
      {/* Resumo de itens por status */}
      <div className="mb-8">
        <h2 className="text-xl font-medium mb-4 flex items-center">
          <Package className="mr-2 h-5 w-5" />
          Resumo de Itens por Status
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.values(ItemStatus).map(status => {
            const itemsWithStatus = items.filter(i => i.status === status);
            const totalQuantity = itemsWithStatus.reduce((sum, i) => sum + i.quantity, 0);
            
            return (
              <Card key={status}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-sm font-medium">
                      <StatusBadge status={status} />
                    </CardTitle>
                    <span className="text-2xl font-bold">{itemsWithStatus.length}</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Quantidade total: {totalQuantity} itens
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
      
      {/* Movimentações recentes */}
      <div>
        <h2 className="text-xl font-medium mb-4 flex items-center">
          <ArrowRightLeft className="mr-2 h-5 w-5" />
          Resumo de Movimentações (Últimos 30 dias)
        </h2>
        
        <div className="bg-slate-50 p-4 rounded-md">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total de Movimentações</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{recentMovements.length}</div>
                <p className="text-xs text-muted-foreground mt-1">Nos últimos 30 dias</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Entradas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{
                  recentMovements.filter(m => m.type === "Entrada").length
                }</div>
                <p className="text-xs text-muted-foreground mt-1">Adições ao estoque</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Saídas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{
                  recentMovements.filter(m => m.type === "Saída").length
                }</div>
                <p className="text-xs text-muted-foreground mt-1">Retiradas do estoque</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
