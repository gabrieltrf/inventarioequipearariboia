import { useState } from 'react';
import { useInventory } from '@/contexts/InventoryContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format, isValid } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { MapPin, Plus, Edit, Trash2, Package, User, Calendar } from 'lucide-react';
import { Location } from '@/types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Link, useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

const Locations = () => {
  const { 
    locations, 
    getItemsByLocation, 
    addLocation, 
    updateLocation, 
    deleteLocation,
    loadingLocations 
  } = useInventory();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  
  const [form, setForm] = useState({
    name: '',
    description: '',
    capacity: '',
    responsible: '',
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const filteredLocations = locations.filter(location => 
    location.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    location.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Helper function to safely format dates
  const formatDate = (date: any): string => {
    // Check if date is null or undefined
    if (!date) return 'N/A';
    
    // If it's a Firebase Timestamp (has toDate method)
    if (date && typeof date === 'object' && 'toDate' in date && typeof date.toDate === 'function') {
      try {
        return format(date.toDate(), 'dd/MM/yyyy', { locale: ptBR });
      } catch (error) {
        console.error("Error converting timestamp:", error);
        return 'Data inválida';
      }
    }
    
    // If it's already a JavaScript Date object
    try {
      return isValid(new Date(date)) 
        ? format(new Date(date), 'dd/MM/yyyy', { locale: ptBR }) 
        : 'Data inválida';
    } catch (error) {
      console.error("Error formatting date:", error);
      return 'Data inválida';
    }
  };

  const handleOpenAddDialog = () => {
    setSelectedLocation(null);
    setForm({
      name: '',
      description: '',
      capacity: '',
      responsible: '',
    });
    setErrors({});
    setDialogOpen(true);
  };

  const handleOpenEditDialog = (location: Location) => {
    setSelectedLocation(location);
    setForm({
      name: location.name,
      description: location.description,
      capacity: location.capacity?.toString() || '',
      responsible: location.responsible || '',
    });
    setErrors({});
    setDialogOpen(true);
  };

  const handleOpenDeleteDialog = (location: Location) => {
    setSelectedLocation(location);
    setConfirmDeleteOpen(true);
  };

  const handleChange = (field: string, value: string) => {
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
    
    if (!form.name.trim()) newErrors.name = 'Nome é obrigatório';
    if (!form.description.trim()) newErrors.description = 'Descrição é obrigatória';
    if (form.capacity && isNaN(Number(form.capacity))) {
      newErrors.capacity = 'Capacidade deve ser um número';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    const locationData = {
      name: form.name.trim(),
      description: form.description.trim(),
      capacity: form.capacity ? Number(form.capacity) : undefined,
      responsible: form.responsible.trim() || undefined
    };
    
    if (selectedLocation) {
      updateLocation(selectedLocation.id, locationData);
    } else {
      addLocation(locationData);
    }
    
    setDialogOpen(false);
  };

  const handleDelete = () => {
    if (selectedLocation) {
      const itemsInLocation = getItemsByLocation(selectedLocation.id);
      if (itemsInLocation.length > 0) {
        toast.error(`Não é possível excluir. Esta localização contém ${itemsInLocation.length} itens.`);
        setConfirmDeleteOpen(false);
        return;
      }
      
      deleteLocation(selectedLocation.id);
      setConfirmDeleteOpen(false);
    }
  };

  const handleViewLocation = (locationId: string) => {
    navigate(`/localizacoes/${locationId}`);
  };

  return (
    <div className="container mx-auto px-4 py-4 max-w-7xl">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <MapPin className="h-6 w-6" />
          <h1 className="text-2xl font-bold">Localizações</h1>
        </div>
        <Button onClick={handleOpenAddDialog}>
          <Plus className="h-5 w-5 mr-1" />
          Nova Localização
        </Button>
      </div>
      
      <div className="mb-6">
        <Input
          placeholder="Buscar localização..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-md"
        />
      </div>
      
      {loadingLocations ? (
        <div className="flex justify-center py-12">
          <div className="flex flex-col items-center space-y-2">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
            <p className="text-sm text-muted-foreground">Carregando localizações...</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredLocations.map((location) => {
            const itemsInLocation = getItemsByLocation(location.id);
            return (
              <Card key={location.id} className="flex flex-col">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <h3 className="text-lg font-semibold">{location.name}</h3>
                    <div className="flex gap-1">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="h-7 w-7 p-0"
                        onClick={() => handleOpenEditDialog(location)}
                        aria-label="Editar localização"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="h-7 w-7 p-0 text-destructive"
                        onClick={() => handleOpenDeleteDialog(location)}
                        aria-label="Excluir localização"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">{location.description}</p>
                </CardHeader>
                <CardContent className="grow">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        {itemsInLocation.length} item{itemsInLocation.length !== 1 && 's'}
                      </span>
                      {location.capacity && (
                        <Badge variant="outline" className="ml-auto">
                          Capacidade: {location.capacity}
                        </Badge>
                      )}
                    </div>
                    
                    {location.responsible && (
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{location.responsible}</span>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">
                        Criado em {formatDate(location.createdAt)}
                      </span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <div className="w-full text-xs text-muted-foreground mt-2 flex justify-between">
                    <span>Criado em: {formatDate(location.createdAt)}</span>
                    <span>Atualizado em: {formatDate(location.updatedAt)}</span>
                  </div>
                  <Button variant="outline" className="w-full" onClick={() => handleViewLocation(location.id)}>
                    Ver Itens
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
          
          {filteredLocations.length === 0 && (
            <div className="col-span-full flex flex-col items-center justify-center py-10 text-muted-foreground">
              <MapPin className="h-10 w-10 mb-2" />
              <h3 className="text-lg font-medium">Nenhuma localização encontrada</h3>
              <p className="text-sm">Adicione uma nova localização ou tente outra busca</p>
            </div>
          )}
        </div>
      )}
      
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedLocation ? 'Editar localização' : 'Nova localização'}
            </DialogTitle>
            <DialogDescription>
              {selectedLocation 
                ? 'Atualize os dados da localização abaixo.' 
                : 'Preencha os dados para adicionar uma nova localização.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome</Label>
              <Input 
                id="name"
                value={form.name}
                onChange={(e) => handleChange('name', e.target.value)}
                className={errors.name ? 'border-destructive' : ''}
              />
              {errors.name && <p className="text-destructive text-sm">{errors.name}</p>}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea 
                id="description"
                value={form.description}
                onChange={(e) => handleChange('description', e.target.value)}
                className={errors.description ? 'border-destructive' : ''}
              />
              {errors.description && <p className="text-destructive text-sm">{errors.description}</p>}
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="capacity">Capacidade</Label>
                <Input 
                  id="capacity"
                  type="number"
                  min="1"
                  value={form.capacity}
                  onChange={(e) => handleChange('capacity', e.target.value)}
                  className={errors.capacity ? 'border-destructive' : ''}
                  placeholder="Opcional"
                />
                {errors.capacity && <p className="text-destructive text-sm">{errors.capacity}</p>}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="responsible">Responsável</Label>
                <Input 
                  id="responsible"
                  value={form.responsible}
                  onChange={(e) => handleChange('responsible', e.target.value)}
                  placeholder="Opcional"
                />
              </div>
            </div>
            
            <div className="flex justify-end gap-2 pt-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setDialogOpen(false)}
              >
                Cancelar
              </Button>
              <Button type="submit">
                {selectedLocation ? 'Salvar alterações' : 'Adicionar localização'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
      
      <Dialog open={confirmDeleteOpen} onOpenChange={setConfirmDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar exclusão</DialogTitle>
            <DialogDescription>
              Esta ação não poderá ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <p>
            Tem certeza que deseja excluir a localização <strong>{selectedLocation?.name}</strong>?
          </p>
          <div className="flex justify-end gap-2 pt-4">
            <Button 
              variant="outline" 
              onClick={() => setConfirmDeleteOpen(false)}
            >
              Cancelar
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDelete}
            >
              Excluir localização
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Locations;
