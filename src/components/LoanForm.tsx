
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Item, User, Loan } from '@/types';
import { useState } from 'react';
import { useInventory } from '@/contexts/InventoryContext';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface LoanFormProps {
  item: Item;
  onSubmit: (loan: Omit<Loan, 'id'>) => void;
  onCancel: () => void;
}

const LoanForm = ({ item, onSubmit, onCancel }: LoanFormProps) => {
  const { users, currentUser } = useInventory();
  
  const today = new Date();
  const nextWeek = new Date();
  nextWeek.setDate(today.getDate() + 7);
  
  const [form, setForm] = useState({
    borrowerId: currentUser.id,
    quantity: 1,
    borrowDate: today,
    expectedReturnDate: nextWeek,
    notes: ''
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (field: string, value: any) => {
    setForm(prev => ({ ...prev, [field]: value }));
    // Limpar erro do campo quando for alterado
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
    
    if (!form.borrowerId) newErrors.borrowerId = 'Usuário é obrigatório';
    if (form.quantity <= 0) newErrors.quantity = 'Quantidade deve ser maior que zero';
    if (form.quantity > item.quantity) newErrors.quantity = `Quantidade máxima disponível: ${item.quantity}`;
    if (!form.borrowDate) newErrors.borrowDate = 'Data de empréstimo é obrigatória';
    if (!form.expectedReturnDate) newErrors.expectedReturnDate = 'Data de devolução é obrigatória';
    if (form.expectedReturnDate < form.borrowDate) {
      newErrors.expectedReturnDate = 'Data de devolução deve ser posterior à data de empréstimo';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    const borrower = users.find(u => u.id === form.borrowerId);
    
    if (!borrower) {
      setErrors({ borrowerId: 'Usuário não encontrado' });
      return;
    }
    
    onSubmit({
      item,
      borrower,
      quantity: form.quantity,
      borrowDate: form.borrowDate,
      expectedReturnDate: form.expectedReturnDate,
      notes: form.notes
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <h3 className="font-semibold">Item: {item.name}</h3>
        <p className="text-sm text-muted-foreground">
          Disponível: {item.quantity} {item.unit}
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="borrower">Responsável</Label>
          <Select 
            value={form.borrowerId} 
            onValueChange={(value) => handleChange('borrowerId', value)}
          >
            <SelectTrigger className={errors.borrowerId ? 'border-destructive' : ''}>
              <SelectValue placeholder="Selecione um usuário" />
            </SelectTrigger>
            <SelectContent>
              {users.map((user) => (
                <SelectItem key={user.id} value={user.id}>{user.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.borrowerId && <p className="text-destructive text-sm">{errors.borrowerId}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="quantity">Quantidade</Label>
          <Input 
            id="quantity"
            type="number"
            min="1"
            max={item.quantity}
            value={form.quantity}
            onChange={(e) => handleChange('quantity', parseInt(e.target.value) || 1)}
            className={errors.quantity ? 'border-destructive' : ''}
          />
          {errors.quantity && <p className="text-destructive text-sm">{errors.quantity}</p>}
        </div>

        <div className="space-y-2">
          <Label>Data de Empréstimo</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !form.borrowDate && "text-muted-foreground",
                  errors.borrowDate && "border-destructive"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {form.borrowDate ? format(form.borrowDate, "dd/MM/yyyy", { locale: ptBR }) : "Selecione a data"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={form.borrowDate}
                onSelect={(date) => handleChange('borrowDate', date)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          {errors.borrowDate && <p className="text-destructive text-sm">{errors.borrowDate}</p>}
        </div>
        
        <div className="space-y-2">
          <Label>Data prevista para devolução</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !form.expectedReturnDate && "text-muted-foreground",
                  errors.expectedReturnDate && "border-destructive"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {form.expectedReturnDate ? format(form.expectedReturnDate, "dd/MM/yyyy", { locale: ptBR }) : "Selecione a data"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={form.expectedReturnDate}
                onSelect={(date) => handleChange('expectedReturnDate', date)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          {errors.expectedReturnDate && <p className="text-destructive text-sm">{errors.expectedReturnDate}</p>}
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="notes">Observações</Label>
          <Textarea 
            id="notes"
            value={form.notes}
            onChange={(e) => handleChange('notes', e.target.value)}
            placeholder="Finalidade do empréstimo, condições, etc."
            className="min-h-[80px]"
          />
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit">
          Registrar Empréstimo
        </Button>
      </div>
    </form>
  );
};

export default LoanForm;
