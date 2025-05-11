import { useEffect, useState } from 'react';
import { useInventory } from '@/contexts/InventoryContext';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from '@/components/ui/input';
import { 
  MapPin, 
  Package, 
  User, 
  Calendar, 
  ArrowLeft, 
  Search,
  Edit,
  AlertTriangle
} from 'lucide-react';
import { format, isValid } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import StatusBadge from '@/components/StatusBadge';
import { Badge } from '@/components/ui/badge';
import { Item } from '@/types';

const LocationDetail = () => {
  const { locationId } = useParams<{ locationId: string }>();
  const navigate = useNavigate();
  const { getLocationById, getItemsByLocation, updateItem } = useInventory();
  
  const [location, setLocation] = useState(
    locationId ? getLocationById(locationId) : undefined
  );
  const [items, setItems] = useState<Item[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  
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
  
  useEffect(() => {
    if (locationId) {
      const locationData = getLocationById(locationId);
      if (locationData) {
        setLocation(locationData);
        setItems(getItemsByLocation(locationId));
      } else {
        // Se a localização não for encontrada, redirecionar para a lista de localizações
        navigate('/localizacoes');
      }
    }
  }, [locationId, getLocationById, getItemsByLocation, navigate]);
  
  if (!location) {
    return (
      <div className="container mx-auto px-4 py-4 max-w-7xl">
        <div className="flex items-center justify-center h-40">
          <div className="text-center">
            <AlertTriangle className="mx-auto h-8 w-8 text-amber-500 mb-2" />
            <h2 className="text-lg font-medium">Localização não encontrada</h2>
            <Button className="mt-4" asChild>
              <Link to="/localizacoes">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar para localizações
              </Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }
  
  const filteredItems = items.filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.category.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="container mx-auto px-4 py-4 max-w-7xl">
      <div className="mb-6">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link to="/localizacoes">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Voltar
            </Link>
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    {location.name}
                  </CardTitle>
                  <CardDescription className="mt-1">
                    Detalhes da localização
                  </CardDescription>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => navigate('/localizacoes', { state: { editLocation: location.id } })}
                  aria-label="Editar localização"
                >
                  <Edit className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-sm font-medium mb-1">Descrição</h3>
                <p className="text-sm">{location.description}</p>
              </div>
              
              {location.capacity && (
                <div>
                  <h3 className="text-sm font-medium mb-1">Capacidade</h3>
                  <div className="flex items-center">
                    <Badge variant="outline">
                      {location.capacity} itens
                    </Badge>
                    <div className="ml-2 text-xs text-muted-foreground">
                      {items.length}/{location.capacity} utilizados
                    </div>
                  </div>
                </div>
              )}
              
              {location.responsible && (
                <div>
                  <h3 className="text-sm font-medium mb-1">Responsável</h3>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span>{location.responsible}</span>
                  </div>
                </div>
              )}
              
              <div>
                <h3 className="text-sm font-medium mb-1">Data de cadastro</h3>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>{formatDate(location.createdAt)}</span>
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium mb-1">Última atualização</h3>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>{formatDate(location.updatedAt)}</span>
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium mb-1">Estatísticas</h3>
                <div className="grid grid-cols-2 gap-2">
                  <Card>
                    <CardContent className="p-3">
                      <div className="text-xs text-muted-foreground">Total de itens</div>
                      <div className="text-2xl font-bold">{items.length}</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-3">
                      <div className="text-xs text-muted-foreground">Categorias</div>
                      <div className="text-2xl font-bold">
                        {new Set(items.map(item => item.category.id)).size}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    Itens nesta localização
                  </CardTitle>
                  <CardDescription className="mt-1">
                    {items.length} {items.length === 1 ? 'item encontrado' : 'itens encontrados'}
                  </CardDescription>
                </div>
              </div>
              
              <div className="mt-2">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar item por nome, descrição ou categoria..."
                    className="pl-9"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {filteredItems.length > 0 ? (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nome</TableHead>
                        <TableHead>Categoria</TableHead>
                        <TableHead className="text-center">Quantidade</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredItems.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>
                            <div className="font-medium">{item.name}</div>
                            <div className="text-xs text-muted-foreground">
                              {item.description.length > 50 
                                ? `${item.description.substring(0, 50)}...` 
                                : item.description}
                            </div>
                          </TableCell>
                          <TableCell>{item.category.name}</TableCell>
                          <TableCell className="text-center">
                            {item.quantity} {item.unit}
                          </TableCell>
                          <TableCell>
                            <StatusBadge status={item.status} />
                          </TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="sm" asChild>
                              <Link to={`/?itemId=${item.id}`}>
                                Ver detalhes
                              </Link>
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Package className="mx-auto h-8 w-8 text-muted-foreground opacity-50" />
                  <p className="mt-2 text-muted-foreground">
                    Nenhum item encontrado nesta localização
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default LocationDetail;
