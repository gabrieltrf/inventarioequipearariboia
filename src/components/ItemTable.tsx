
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Item, UserRole } from '@/types';
import StatusBadge from './StatusBadge';
import { Button } from '@/components/ui/button';
import { Edit, PackageOpen, ArrowRight, Trash2 } from 'lucide-react';
import { useInventory } from '@/contexts/InventoryContext';
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface ItemTableProps {
  items: Item[];
  onEdit: (item: Item) => void;
  onLoan: (item: Item) => void;
  onViewDetails: (item: Item) => void;
}

const ItemTable = ({ items, onEdit, onLoan, onViewDetails }: ItemTableProps) => {
  const { deleteItem, currentUser } = useInventory();
  const [confirmDelete, setConfirmDelete] = useState<{ open: boolean, item: Item | null }>({
    open: false,
    item: null
  });
  const isAdmin = currentUser.role === UserRole.ADMIN;

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
            {items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  Nenhum item encontrado.
                </TableCell>
              </TableRow>
            ) : (
              items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.id}</TableCell>
                  <TableCell>{item.name}</TableCell>
                  <TableCell>{item.category.name}</TableCell>
                  <TableCell className="text-center">{item.quantity} {item.unit}</TableCell>
                  <TableCell>{item.location}</TableCell>
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
