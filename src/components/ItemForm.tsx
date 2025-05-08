
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Item, ItemCategory, ItemStatus } from '@/types';
import { useState, useEffect } from 'react';
import { useInventory } from '@/contexts/InventoryContext';

interface ItemFormProps {
  initialItem?: Item;
  onSubmit: (item: Omit<Item, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
}

const statusOptions = Object.values(ItemStatus);

const ItemForm = ({ initialItem, onSubmit, onCancel }: ItemFormProps) => {
  const { categories } = useInventory();
  const [form, setForm] = useState({
    name: initialItem?.name || '',
    description: initialItem?.description || '',
    categoryId: initialItem?.category.id || categories[0]?.id || '',
    quantity: initialItem?.quantity || 0,
    minQuantity: initialItem?.minQuantity || 0,
    unit: initialItem?.unit || 'unidade',
    location: initialItem?.location || '',
    status: initialItem?.status || ItemStatus.AVAILABLE,
    imageUrl: initialItem?.imageUrl || ''
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (field: string, value: string | number) => {
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
    
    if (!form.name.trim()) newErrors.name = 'Nome é obrigatório';
    if (!form.description.trim()) newErrors.description = 'Descrição é obrigatória';
    if (!form.categoryId) newErrors.categoryId = 'Categoria é obrigatória';
    if (form.quantity < 0) newErrors.quantity = 'Quantidade não pode ser negativa';
    if (form.minQuantity < 0) newErrors.minQuantity = 'Quantidade mínima não pode ser negativa';
    if (!form.unit.trim()) newErrors.unit = 'Unidade é obrigatória';
    if (!form.location.trim()) newErrors.location = 'Localização é obrigatória';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    const selectedCategory = categories.find(c => c.id === form.categoryId);
    
    if (!selectedCategory) {
      setErrors({ categoryId: 'Categoria não encontrada' });
      return;
    }
    
    onSubmit({
      name: form.name,
      description: form.description,
      category: selectedCategory,
      quantity: Number(form.quantity),
      minQuantity: Number(form.minQuantity),
      unit: form.unit,
      location: form.location,
      status: form.status,
      imageUrl: form.imageUrl
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Nome do Item</Label>
          <Input 
            id="name"
            value={form.name}
            onChange={(e) => handleChange('name', e.target.value)}
            className={errors.name ? 'border-destructive' : ''}
          />
          {errors.name && <p className="text-destructive text-sm">{errors.name}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="category">Categoria</Label>
          <Select 
            value={form.categoryId} 
            onValueChange={(value) => handleChange('categoryId', value)}
          >
            <SelectTrigger className={errors.categoryId ? 'border-destructive' : ''}>
              <SelectValue placeholder="Selecione uma categoria" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>{category.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.categoryId && <p className="text-destructive text-sm">{errors.categoryId}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="quantity">Quantidade</Label>
          <Input 
            id="quantity"
            type="number"
            min="0"
            value={form.quantity}
            onChange={(e) => handleChange('quantity', parseInt(e.target.value) || 0)}
            className={errors.quantity ? 'border-destructive' : ''}
          />
          {errors.quantity && <p className="text-destructive text-sm">{errors.quantity}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="minQuantity">Quantidade Mínima</Label>
          <Input 
            id="minQuantity"
            type="number"
            min="0"
            value={form.minQuantity}
            onChange={(e) => handleChange('minQuantity', parseInt(e.target.value) || 0)}
            className={errors.minQuantity ? 'border-destructive' : ''}
          />
          {errors.minQuantity && <p className="text-destructive text-sm">{errors.minQuantity}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="unit">Unidade de Medida</Label>
          <Input 
            id="unit"
            value={form.unit}
            onChange={(e) => handleChange('unit', e.target.value)}
            className={errors.unit ? 'border-destructive' : ''}
          />
          {errors.unit && <p className="text-destructive text-sm">{errors.unit}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="location">Localização</Label>
          <Input 
            id="location"
            value={form.location}
            onChange={(e) => handleChange('location', e.target.value)}
            className={errors.location ? 'border-destructive' : ''}
          />
          {errors.location && <p className="text-destructive text-sm">{errors.location}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select 
            value={form.status} 
            onValueChange={(value) => handleChange('status', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione um status" />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map((status) => (
                <SelectItem key={status} value={status}>{status}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="description">Descrição</Label>
          <Textarea 
            id="description"
            value={form.description}
            onChange={(e) => handleChange('description', e.target.value)}
            className={`min-h-[100px] ${errors.description ? 'border-destructive' : ''}`}
          />
          {errors.description && <p className="text-destructive text-sm">{errors.description}</p>}
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit">
          {initialItem ? 'Atualizar' : 'Cadastrar'} Item
        </Button>
      </div>
    </form>
  );
};

export default ItemForm;
