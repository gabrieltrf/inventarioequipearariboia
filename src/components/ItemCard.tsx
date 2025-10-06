import { Item } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import StatusBadge from './StatusBadge';
import { Edit, Trash2, PackageOpen, ArrowRight, ImageIcon } from 'lucide-react';
import { useInventory } from '@/contexts/InventoryContext';
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { UserRole } from '@/types';

interface ItemCardProps {
  item: Item;
  onEdit: (item: Item) => void;
  onLoan: (item: Item) => void;
  onViewDetails: (item: Item) => void;
}

const ItemCard = ({ item, onEdit, onLoan, onViewDetails }: ItemCardProps) => {
  const { deleteItem, currentUser } = useInventory();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const isAdmin = currentUser.role === UserRole.ADMIN;

  const handleDelete = () => {
    deleteItem(item.id);
    setConfirmOpen(false);
  };

  return (
    <>
      <Card className="h-full flex flex-col">
        {/* Adiciona imagem se disponível */}
        {item.imageUrl && (
          <div className="relative w-full h-32 bg-slate-100">
            <img 
              src={item.imageUrl} 
              alt={item.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.src = '';
                e.currentTarget.style.display = 'none';
              }}
            />
          </div>
        )}
        {!item.imageUrl && (
          <div className="w-full h-20 bg-slate-100 flex items-center justify-center">
            <ImageIcon className="h-8 w-8 text-slate-300" />
          </div>
        )}
        
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <CardTitle className="text-lg font-medium">{item.name}</CardTitle>
            <StatusBadge status={item.status} />
          </div>
          <div className="text-sm text-muted-foreground">
            ID: {item.id} | {item.category.name}
          </div>
        </CardHeader>
        <CardContent className="py-2 flex-grow">
          <div className="text-sm">
            <div className="mb-1">
              <strong>Qtd:</strong> {item.quantity} {item.unit}
            </div>
            <div className="mb-1">
              <strong>Local:</strong> {item.locationId}
            </div>
            <div className="line-clamp-2 text-muted-foreground">
              {item.description}
            </div>
          </div>
        </CardContent>
        <CardFooter className="pt-2 flex justify-between">
          <Button variant="outline" size="sm" onClick={() => onViewDetails(item)}>
            <PackageOpen className="h-4 w-4 mr-1" />
            Detalhes
          </Button>
          <div className="space-x-1">
            {isAdmin && (
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onEdit(item)}>
                <Edit className="h-4 w-4" />
              </Button>
            )}
            {item.status !== 'Emprestado' && item.quantity > 0 && (
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onLoan(item)}>
                <ArrowRight className="h-4 w-4" />
              </Button>
            )}
            {isAdmin && (
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 text-destructive hover:text-destructive" 
                onClick={() => setConfirmOpen(true)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </CardFooter>
      </Card>

      {/* Diálogo de confirmação para excluir */}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar exclusão</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            Tem certeza que deseja excluir o item <strong>{item.name}</strong>?
            <br />
            Esta ação não pode ser desfeita.
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>Cancelar</Button>
            <Button variant="destructive" onClick={handleDelete}>Excluir</Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ItemCard;
