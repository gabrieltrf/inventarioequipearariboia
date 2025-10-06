import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Item, UserRole } from '@/types';
import StatusBadge from './StatusBadge';
import { Button } from '@/components/ui/button';
import { Edit, PackageOpen, ArrowRight, Trash2 } from 'lucide-react';
import { useInventory } from '@/contexts/InventoryContext';
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface ItemTableProps {
  items: Item[];
  onEdit: (item: Item) => void;
  onLoan: (item: Item) => void;
  onViewDetails: (item: Item) => void;
  loading?: boolean;
}

const ItemTable = ({ items, onEdit, onLoan, onViewDetails, loading = false }: ItemTableProps) => {
  const { deleteItem, currentUser, getLocationById } = useInventory();
  const [confirmDelete, setConfirmDelete] = useState<{ open: boolean, item: Item | null }>({
    open: false,
    item: null
  });
  const isAdmin = currentUser.role === UserRole.ADMIN;

  // Helper function to get location name from ID
  const getLocationName = (locationId: string): string => {
    const location = getLocationById(locationId);
    return location ? location.name : 'Desconhecida';
  };

  const handleDelete = () => {
    if (confirmDelete.item) {
      deleteItem(confirmDelete.item.id);
      setConfirmDelete({ open: false, item: null });
    }
  };

  return (
    <>
      <div className="rounded-md border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px]">ID</TableHead>
              <TableHead>Nome</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead className="text-center">Quantidade</TableHead>
              <TableHead>Localização</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24">
                  <div className="flex justify-center items-center">
                    <div className="flex flex-col items-center space-y-2">
                      <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                      <p className="text-sm text-muted-foreground">Carregando itens...</p>
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            ) : items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  Nenhum item encontrado.
                </TableCell>
              </TableRow>
            ) : (
              items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.id}</TableCell>
                  <TableCell>
                    {item.imageUrl ? (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="cursor-pointer hover:underline">{item.name}</span>
                          </TooltipTrigger>
                          <TooltipContent side="right" className="p-0 bg-transparent border-0" sideOffset={40}>
                            <div className="bg-white p-1 rounded-md shadow-lg border">
                              <div className="relative" style={{ width: '200px', height: '150px' }}>
                                <img 
                                  src={item.imageUrl} 
                                  alt={item.name}
                                  className="w-full h-full object-contain"
                                  onError={(e) => {
                                    e.currentTarget.src = '';
                                    e.currentTarget.style.display = 'none';
                                    e.currentTarget.parentElement!.innerHTML = '<div class="w-full h-full flex items-center justify-center bg-slate-100"><span class="text-xs text-slate-400">Imagem indisponível</span></div>';
                                  }}
                                />
                              </div>
                              <div className="text-center text-xs py-1 text-slate-600">
                                {item.name}
                              </div>
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    ) : (
                      <span className="flex items-center gap-1">
                        {item.name}
                      </span>
                    )}
                  </TableCell>
                  <TableCell>{item.category.name}</TableCell>
                  <TableCell className="text-center">{item.quantity} {item.unit}</TableCell>
                  <TableCell>{getLocationName(item.locationId)}</TableCell>
                  <TableCell>
                    <StatusBadge status={item.status} />
                  </TableCell>
                  <TableCell className="text-right space-x-1">
                    <Button variant="ghost" size="icon" onClick={() => onViewDetails(item)}>
                      <PackageOpen className="h-4 w-4" />
                    </Button>
                    {isAdmin && (
                      <Button variant="ghost" size="icon" onClick={() => onEdit(item)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                    )}
                    {item.status !== 'Emprestado' && item.quantity > 0 && (
                      <Button variant="ghost" size="icon" onClick={() => onLoan(item)}>
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    )}
                    {isAdmin && (
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-destructive hover:text-destructive" 
                        onClick={() => setConfirmDelete({ open: true, item })}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Diálogo de confirmação para excluir */}
      <Dialog open={confirmDelete.open} onOpenChange={(open) => setConfirmDelete({ ...confirmDelete, open })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar exclusão</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            Tem certeza que deseja excluir o item <strong>{confirmDelete.item?.name}</strong>?
            <br />
            Esta ação não pode ser desfeita.
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setConfirmDelete({ open: false, item: null })}>Cancelar</Button>
            <Button variant="destructive" onClick={handleDelete}>Excluir</Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ItemTable;
