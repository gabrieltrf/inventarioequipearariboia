import { useInventory } from '@/contexts/InventoryContext';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ArrowRightLeft, ArrowUp, ArrowDown, Plus } from 'lucide-react';
import { Item, MovementReason, MovementType } from '@/types';

const Movements = () => {
  const { items, movements, addMovement, currentUser } = useInventory();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({
    itemId: '',
    type: MovementType.INPUT,
    reason: MovementReason.PURCHASE,
    quantity: 1,
    notes: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (field: string, value: string | number | MovementType | MovementReason) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!form.itemId) newErrors.itemId = 'Item é obrigatório';
    if (form.quantity <= 0) newErrors.quantity = 'Quantidade deve ser maior que zero';
    
    const selectedItem = items.find(item => item.id === form.itemId);
    if (selectedItem && form.type === MovementType.OUTPUT && form.quantity > selectedItem.quantity) {
      newErrors.quantity = `Quantidade máxima disponível: ${selectedItem.quantity}`;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    const selectedItem = items.find(item => item.id === form.itemId);
    
    if (!selectedItem) {
      setErrors({ itemId: 'Item não encontrado' });
      return;
    }
    
    addMovement({
      item: selectedItem,
      type: form.type,
      reason: form.reason,
      quantity: form.quantity,
      responsibleUser: currentUser,
      notes: form.notes,
    });
    
    resetForm();
    setDialogOpen(false);
  };

  const resetForm = () => {
    setForm({
      itemId: '',
      type: MovementType.INPUT,
      reason: MovementReason.PURCHASE,
      quantity: 1,
      notes: '',
    });
    setErrors({});
  };

  return (
    <div className="container mx-auto px-4 py-4 max-w-7xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Movimentações de Estoque</h1>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="h-5 w-5 mr-1" />
          Nova Movimentação
        </Button>
      </div>
      
      <div className="rounded-md border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Data/Hora</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Item</TableHead>
              <TableHead>Motivo</TableHead>
              <TableHead className="text-center">Quantidade</TableHead>
              <TableHead>Responsável</TableHead>
              <TableHead>Observações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {movements.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  Não há movimentações registradas.
                </TableCell>
              </TableRow>
            ) : (
              [...movements]
                .sort((a, b) => b.date.getTime() - a.date.getTime()) // Ordenar por data decrescente
                .map((movement) => (
                <TableRow key={movement.id}>
                  <TableCell>
                    {format(movement.date, "dd/MM/yyyy HH:mm", { locale: ptBR })}
                  </TableCell>
                  <TableCell>
                    <span className={`flex items-center gap-1 ${
                      movement.type === MovementType.INPUT 
                        ? 'text-green-600' 
                        : 'text-blue-600'}`}
                    >
                      {movement.type === MovementType.INPUT 
                        ? <ArrowUp className="h-4 w-4" />
                        : <ArrowDown className="h-4 w-4" />
                      }
                      {movement.type}
                    </span>
                  </TableCell>
                  <TableCell className="font-medium">
                    {movement.item.name} <span className="text-xs text-muted-foreground">({movement.item.id})</span>
                  </TableCell>
                  <TableCell>{movement.reason}</TableCell>
                  <TableCell className="text-center">{movement.quantity} {movement.item.unit}</TableCell>
                  <TableCell>{movement.responsibleUser.name}</TableCell>
                  <TableCell className="max-w-xs truncate" title={movement.notes}>
                    {movement.notes || '-'}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      
      <Dialog open={dialogOpen} onOpenChange={(open) => {
        if (!open) resetForm();
        setDialogOpen(open);
      }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Nova Movimentação de Estoque</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="item">Item</Label>
              <Select 
                value={form.itemId} 
                onValueChange={(value) => handleChange('itemId', value)}
              >
                <SelectTrigger className={errors.itemId ? 'border-destructive' : ''}>
                  <SelectValue placeholder="Selecione um item" />
                </SelectTrigger>
                <SelectContent>
                  {items.map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      {item.name} ({item.quantity} {item.unit})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.itemId && <p className="text-destructive text-sm">{errors.itemId}</p>}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="type">Tipo de Movimentação</Label>
              <Select 
                value={form.type} 
                onValueChange={(value) => handleChange('type', value as MovementType)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(MovementType).map((type) => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="reason">Motivo</Label>
              <Select 
                value={form.reason} 
                onValueChange={(value) => handleChange('reason', value as MovementReason)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(MovementReason).map((reason) => (
                    <SelectItem key={reason} value={reason}>{reason}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantidade</Label>
              <Input 
                id="quantity"
                type="number"
                min="1"
                value={form.quantity}
                onChange={(e) => handleChange('quantity', parseInt(e.target.value) || 1)}
                className={errors.quantity ? 'border-destructive' : ''}
              />
              {errors.quantity && <p className="text-destructive text-sm">{errors.quantity}</p>}
              {form.itemId && form.type === MovementType.OUTPUT && (
                <div className="text-xs text-muted-foreground">
                  Estoque disponível: {items.find(item => item.id === form.itemId)?.quantity || 0} 
                  {' '}{items.find(item => item.id === form.itemId)?.unit || ''}
                </div>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="notes">Observações</Label>
              <Textarea 
                id="notes"
                value={form.notes}
                onChange={(e) => handleChange('notes', e.target.value)}
                placeholder="Detalhes adicionais (opcional)"
                className="min-h-[80px]"
              />
            </div>
            
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit">
                Registrar Movimentação
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Movements;
