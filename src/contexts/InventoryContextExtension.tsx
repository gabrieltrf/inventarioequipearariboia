
import { useInventory } from '@/contexts/InventoryContext';
import { toast } from '@/hooks/use-toast';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import * as XLSX from 'xlsx';

// Extensão da tipagem para notificações
export interface Notification {
  id: string;
  type: 'emprestimo' | 'devolucao_atrasada' | 'estoque_baixo' | 'movimentacao' | 'sistema';
  title: string;
  itemName?: string;
  itemId?: string;
  message: string;
  date: Date;
  read: boolean;
  actionLink?: string;
}

// Hook de utilidade para exportação
export function useExport() {
  const { items, loans, movements } = useInventory();

  // Exportar para PDF
  const exportToPdf = (type: 'inventario' | 'emprestimos' | 'movimentacoes') => {
    const doc = new jsPDF();
    const currentDate = format(new Date(), 'dd/MM/yyyy HH:mm', { locale: ptBR });
    
    doc.setFontSize(18);
    doc.text('Inventário Fácil - Relatório', 14, 22);
    
    doc.setFontSize(11);
    doc.text(`Data de geração: ${currentDate}`, 14, 30);
    
    if (type === 'inventario') {
      doc.text('Relatório de Inventário', 14, 38);
      
      const data = items.map((item) => [
        item.id,
        item.name,
        item.category,
        `${item.quantity} ${item.unit}`,
        item.location,
        item.status
      ]);
      
      (doc as any).autoTable({
        startY: 45,
        head: [['ID', 'Nome', 'Categoria', 'Quantidade', 'Localização', 'Status']],
        body: data,
      });
    } 
    else if (type === 'emprestimos') {
      doc.text('Relatório de Empréstimos', 14, 38);
      
      const data = loans.map((loan) => [
        loan.id,
        loan.item.name,
        loan.borrower.name,
        `${loan.quantity} ${loan.item.unit}`,
        format(loan.borrowDate, 'dd/MM/yyyy', { locale: ptBR }),
        format(loan.expectedReturnDate, 'dd/MM/yyyy', { locale: ptBR }),
        loan.actualReturnDate 
          ? format(loan.actualReturnDate, 'dd/MM/yyyy', { locale: ptBR }) 
          : 'Não devolvido'
      ]);
      
      (doc as any).autoTable({
        startY: 45,
        head: [['ID', 'Item', 'Responsável', 'Quantidade', 'Data Empréstimo', 'Data Prevista', 'Data Devolução']],
        body: data,
      });
    } 
    else if (type === 'movimentacoes') {
      doc.text('Relatório de Movimentações', 14, 38);
      
      const data = movements.map((movement) => [
        movement.id,
        movement.item.name,
        movement.type,
        `${movement.quantity} ${movement.item.unit}`,
        movement.reason,
        format(movement.date, 'dd/MM/yyyy', { locale: ptBR }),
        movement.responsible || 'Não especificado'
      ]);
      
      (doc as any).autoTable({
        startY: 45,
        head: [['ID', 'Item', 'Tipo', 'Quantidade', 'Motivo', 'Data', 'Responsável']],
        body: data,
      });
    }
    
    doc.save(`relatorio-${type}-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
    
    toast({
      title: 'PDF gerado com sucesso',
      description: `O relatório em PDF foi gerado e está sendo baixado.`,
    });
  };
  
  // Exportar para Excel
  const exportToExcel = (type: 'inventario' | 'emprestimos' | 'movimentacoes') => {
    let data: any[] = [];
    let fileName = '';
    
    if (type === 'inventario') {
      fileName = `inventario-${format(new Date(), 'yyyy-MM-dd')}`;
      
      data = items.map((item) => ({
        ID: item.id,
        Nome: item.name,
        Descrição: item.description,
        Categoria: item.category,
        Quantidade: item.quantity,
        Unidade: item.unit,
        Localização: item.location,
        Status: item.status,
        'Data Cadastro': format(item.createdAt, 'dd/MM/yyyy', { locale: ptBR }),
        'Última Atualização': format(item.updatedAt, 'dd/MM/yyyy', { locale: ptBR }),
      }));
    } 
    else if (type === 'emprestimos') {
      fileName = `emprestimos-${format(new Date(), 'yyyy-MM-dd')}`;
      
      data = loans.map((loan) => ({
        ID: loan.id,
        Item: loan.item.name,
        'ID do Item': loan.item.id,
        Responsável: loan.borrower.name,
        Quantidade: loan.quantity,
        Unidade: loan.item.unit,
        'Data Empréstimo': format(loan.borrowDate, 'dd/MM/yyyy', { locale: ptBR }),
        'Data Prevista': format(loan.expectedReturnDate, 'dd/MM/yyyy', { locale: ptBR }),
        'Data Devolução': loan.actualReturnDate 
          ? format(loan.actualReturnDate, 'dd/MM/yyyy', { locale: ptBR }) 
          : 'Não devolvido',
        Observações: loan.notes || '',
      }));
    } 
    else if (type === 'movimentacoes') {
      fileName = `movimentacoes-${format(new Date(), 'yyyy-MM-dd')}`;
      
      data = movements.map((movement) => ({
        ID: movement.id,
        Item: movement.item.name,
        'ID do Item': movement.item.id,
        Tipo: movement.type,
        Quantidade: movement.quantity,
        Unidade: movement.item.unit,
        Motivo: movement.reason,
        Data: format(movement.date, 'dd/MM/yyyy', { locale: ptBR }),
        Responsável: movement.responsible || 'Não especificado',
        Observações: movement.notes || '',
      }));
    }
    
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Relatório");
    XLSX.writeFile(workbook, `${fileName}.xlsx`);
    
    toast({
      title: 'Excel gerado com sucesso',
      description: `O relatório em Excel foi gerado e está sendo baixado.`,
    });
  };
  
  // Gerar QR Code para um item
  const generateItemQrCode = (itemId: string) => {
    // Aqui retornaríamos uma URL para o QR Code
    // Em uma implementação real, você usaria uma biblioteca como qrcode.react
    const baseUrl = window.location.origin;
    return `${baseUrl}/qr/${itemId}`;
  };

  return { exportToPdf, exportToExcel, generateItemQrCode };
}

export default useExport;
