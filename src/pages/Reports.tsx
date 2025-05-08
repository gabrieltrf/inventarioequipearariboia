
import { useState } from 'react';
import { useInventory } from '@/contexts/InventoryContext';
import { useExport } from '@/contexts/InventoryContextExtension';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { format, startOfMonth, endOfMonth, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { BarChart3, Calendar, Package, ArrowRightLeft, FilePdf, FileSpreadsheet, QrCode, Calendar as CalendarIcon } from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';

const Reports = () => {
  const { items, loans, movements } = useInventory();
  const { exportToPdf, exportToExcel, generateItemQrCode } = useExport();
  const [dateFilter, setDateFilter] = useState('current');
  
  // Dados para filtrar por mês
  const getCurrentMonthDate = () => {
    switch(dateFilter) {
      case 'current':
        return { start: startOfMonth(new Date()), end: endOfMonth(new Date()) };
      case 'last':
        return { 
          start: startOfMonth(subMonths(new Date(), 1)), 
          end: endOfMonth(subMonths(new Date(), 1)) 
        };
      case 'two_months':
        return { 
          start: startOfMonth(subMonths(new Date(), 2)), 
          end: endOfMonth(subMonths(new Date(), 2)) 
        };
      default:
        return { start: startOfMonth(new Date()), end: endOfMonth(new Date()) };
    }
  };

  const { start, end } = getCurrentMonthDate();

  // Filtragem de dados baseada na data
  const filteredLoans = loans.filter(loan => 
    loan.borrowDate >= start && loan.borrowDate <= end
  );
  
  const filteredMovements = movements.filter(movement => 
    movement.date >= start && movement.date <= end
  );

  // Dados para os gráficos
  const categoryData = items.reduce((acc, item) => {
    const category = acc.find(c => c.name === item.category);
    if (category) {
      category.value += 1;
    } else {
      acc.push({ name: item.category, value: 1 });
    }
    return acc;
  }, [] as { name: string, value: number }[]);

  const statusData = items.reduce((acc, item) => {
    const status = acc.find(s => s.name === item.status);
    if (status) {
      status.value += 1;
    } else {
      acc.push({ name: item.status, value: 1 });
    }
    return acc;
  }, [] as { name: string, value: number }[]);

  const movementTypeData = filteredMovements.reduce((acc, movement) => {
    const type = acc.find(t => t.name === movement.type);
    if (type) {
      type.value += 1;
    } else {
      acc.push({ name: movement.type, value: 1 });
    }
    return acc;
  }, [] as { name: string, value: number }[]);

  // Cores para os gráficos de pizza
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#83a6ed'];

  // Itens com baixo estoque (menos de 5 unidades)
  const lowStockItems = items.filter(item => item.quantity < 5);

  // Itens danificados ou em manutenção
  const problemItems = items.filter(item => 
    item.status === 'Danificado' || item.status === 'Em manutenção'
  );

  // Dados para empréstimos ativos e atrasados
  const activeLoans = loans.filter(loan => !loan.actualReturnDate);
  const lateLoans = activeLoans.filter(loan => new Date() > loan.expectedReturnDate);

  // Função para copiar URL do QR Code
  const copyQrCodeUrl = (itemId: string) => {
    const url = generateItemQrCode(itemId);
    navigator.clipboard.writeText(url);
    alert(`URL copiada: ${url}`);
  };

  return (
    <div className="container mx-auto px-4 py-4 max-w-7xl">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-6 w-6" aria-hidden="true" />
          <h1 className="text-2xl font-bold">Relatórios</h1>
        </div>
        
        <div className="flex gap-2 mt-4 md:mt-0">
          <Select value={dateFilter} onValueChange={setDateFilter}>
            <SelectTrigger className="w-[180px]">
              <CalendarIcon className="mr-2 h-4 w-4" aria-hidden="true" />
              <SelectValue placeholder="Período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="current">Mês atual</SelectItem>
              <SelectItem value="last">Mês passado</SelectItem>
              <SelectItem value="two_months">Dois meses atrás</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Total de Itens</CardTitle>
            <CardDescription>No inventário</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{items.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Empréstimos Ativos</CardTitle>
            <CardDescription>Atual</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{activeLoans.length}</div>
            <p className="text-sm text-muted-foreground mt-1">
              {lateLoans.length > 0 && (
                <span className="text-destructive">{lateLoans.length} atrasados</span>
              )}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Movimentações</CardTitle>
            <CardDescription>
              {format(start, 'MMM yyyy', { locale: ptBR })}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{filteredMovements.length}</div>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="inventory">
        <TabsList className="mb-4 w-full sm:w-auto">
          <TabsTrigger value="inventory" className="flex items-center">
            <Package className="mr-2 h-4 w-4" aria-hidden="true" /> Inventário
          </TabsTrigger>
          <TabsTrigger value="loans" className="flex items-center">
            <Calendar className="mr-2 h-4 w-4" aria-hidden="true" /> Empréstimos
          </TabsTrigger>
          <TabsTrigger value="movements" className="flex items-center">
            <ArrowRightLeft className="mr-2 h-4 w-4" aria-hidden="true" /> Movimentações
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="inventory">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <Card>
              <CardHeader>
                <CardTitle>Distribuição por Categoria</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {categoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`${value} itens`, 'Quantidade']} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Distribuição por Status</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={statusData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {statusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`${value} itens`, 'Quantidade']} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Itens com Estoque Baixo</CardTitle>
                <CardDescription>Menos de 5 unidades</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Quantidade</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>QR Code</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {lowStockItems.length > 0 ? (
                      lowStockItems.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>{item.name}</TableCell>
                          <TableCell className="font-medium">{item.quantity} {item.unit}</TableCell>
                          <TableCell>{item.status}</TableCell>
                          <TableCell>
                            <Button 
                              size="sm" 
                              variant="ghost"
                              onClick={() => copyQrCodeUrl(item.id)}
                              aria-label={`Copiar URL do QR Code para ${item.name}`}
                            >
                              <QrCode className="h-4 w-4" aria-hidden="true" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center">Nenhum item com estoque baixo</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
              <CardFooter className="flex justify-between border-t p-4">
                <Button 
                  variant="outline"
                  onClick={() => exportToPdf('inventario')}
                  className="flex items-center"
                  aria-label="Exportar para PDF"
                >
                  <FilePdf className="mr-2 h-4 w-4" aria-hidden="true" /> Exportar para PDF
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => exportToExcel('inventario')}
                  className="flex items-center"
                  aria-label="Exportar para Excel"
                >
                  <FileSpreadsheet className="mr-2 h-4 w-4" aria-hidden="true" /> Exportar para Excel
                </Button>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Itens com Problemas</CardTitle>
                <CardDescription>Danificados ou em manutenção</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Quantidade</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Localização</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {problemItems.length > 0 ? (
                      problemItems.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>{item.name}</TableCell>
                          <TableCell>{item.quantity} {item.unit}</TableCell>
                          <TableCell>{item.status}</TableCell>
                          <TableCell>{item.location}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center">Nenhum item com problemas</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="loans">
          <Card>
            <CardHeader>
              <CardTitle>Empréstimos no Período</CardTitle>
              <CardDescription>
                {format(start, 'dd/MM/yyyy', { locale: ptBR })} até {format(end, 'dd/MM/yyyy', { locale: ptBR })}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item</TableHead>
                    <TableHead>Responsável</TableHead>
                    <TableHead>Data Empréstimo</TableHead>
                    <TableHead>Previsão Retorno</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLoans.length > 0 ? (
                    filteredLoans.map((loan) => (
                      <TableRow key={loan.id}>
                        <TableCell>{loan.item.name}</TableCell>
                        <TableCell>{loan.borrower.name}</TableCell>
                        <TableCell>{format(loan.borrowDate, 'dd/MM/yyyy', { locale: ptBR })}</TableCell>
                        <TableCell>{format(loan.expectedReturnDate, 'dd/MM/yyyy', { locale: ptBR })}</TableCell>
                        <TableCell>
                          {loan.actualReturnDate ? (
                            <span className="text-green-600">Devolvido</span>
                          ) : new Date() > loan.expectedReturnDate ? (
                            <span className="text-destructive">Atrasado</span>
                          ) : (
                            <span className="text-amber-500">Em andamento</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center">Nenhum empréstimo no período selecionado</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
            <CardFooter className="flex justify-between border-t p-4">
              <Button 
                variant="outline"
                onClick={() => exportToPdf('emprestimos')}
                className="flex items-center"
                aria-label="Exportar para PDF"
              >
                <FilePdf className="mr-2 h-4 w-4" aria-hidden="true" /> Exportar para PDF
              </Button>
              <Button 
                variant="outline"
                onClick={() => exportToExcel('emprestimos')}
                className="flex items-center"
                aria-label="Exportar para Excel"
              >
                <FileSpreadsheet className="mr-2 h-4 w-4" aria-hidden="true" /> Exportar para Excel
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="movements">
          <Card>
            <CardHeader>
              <CardTitle>Movimentações por Tipo</CardTitle>
              <CardDescription>
                {format(start, 'dd/MM/yyyy', { locale: ptBR })} até {format(end, 'dd/MM/yyyy', { locale: ptBR })}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={movementTypeData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="value" name="Quantidade" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between border-t p-4">
              <Button 
                variant="outline"
                onClick={() => exportToPdf('movimentacoes')}
                className="flex items-center"
                aria-label="Exportar para PDF"
              >
                <FilePdf className="mr-2 h-4 w-4" aria-hidden="true" /> Exportar para PDF
              </Button>
              <Button 
                variant="outline"
                onClick={() => exportToExcel('movimentacoes')}
                className="flex items-center"
                aria-label="Exportar para Excel"
              >
                <FileSpreadsheet className="mr-2 h-4 w-4" aria-hidden="true" /> Exportar para Excel
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Reports;
