import { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Item, ItemStatus } from '@/types';
import ItemTable from '@/components/ItemTable';
import ItemCard from '@/components/ItemCard';
import { useInventory } from '@/contexts/InventoryContext';
import ItemForm from '@/components/ItemForm';
import LoanForm from '@/components/LoanForm';
import ItemDetails from '@/components/ItemDetails';
import { Grid3X3, Table2, Plus, Search, Filter } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { DialogHeader, DialogTitle } from '@/components/ui/dialog';

const Inventory = () => {
  const { items, switchViewMode, isCardView, addItem, updateItem, addLoan, searchItems, filterItemsByStatus, currentUser, loadingItems } = useInventory();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<ItemStatus | null>(null);
  const [dialogContent, setDialogContent] = useState<{
    open: boolean;
    type: 'add' | 'edit' | 'loan' | 'details';
    item?: Item;
  }>({
    open: false,
    type: 'add',
  });

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
  };

  const filteredItems = filterItemsByStatus(statusFilter)
    .filter(item => searchQuery ? 
      searchItems(searchQuery).includes(item) :
      true
    );

  const handleItemAction = (type: 'add' | 'edit' | 'loan' | 'details', item?: Item) => {
    setDialogContent({
      open: true,
      type,
      item,
    });
  };

  const handleDialogClose = () => {
    setDialogContent({
      ...dialogContent,
      open: false,
    });
  };

  const handleAddOrUpdateItem = (itemData: Omit<Item, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (dialogContent.type === 'add') {
      addItem(itemData);
    } else if (dialogContent.type === 'edit' && dialogContent.item) {
      updateItem(dialogContent.item.id, itemData);
    }
    handleDialogClose();
  };

  const handleAddLoan = (loanData: any) => {
    addLoan(loanData);
    handleDialogClose();
  };

  const clearFilters = () => {
    setSearchQuery('');
    setStatusFilter(null);
  };

  return (
    <div className="container mx-auto px-4 py-4 max-w-7xl">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold">Inventário</h1>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={switchViewMode}
            title={isCardView ? 'Visualização em tabela' : 'Visualização em cards'}
          >
            {isCardView ? <Table2 className="h-5 w-5" /> : <Grid3X3 className="h-5 w-5" />}
          </Button>
          <Button 
            onClick={() => handleItemAction('add')}
            title="Adicionar novo item"
          >
            <Plus className="h-5 w-5 mr-1" />
            Novo Item
          </Button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <form onSubmit={handleSearch} className="flex-grow flex">
          <div className="relative w-full">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar itens por nome, ID, categoria ou localização..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </form>
        <div className="flex gap-4 flex-shrink-0">
          <div className="w-[180px]">
            <Select
              value={statusFilter || ''}
              onValueChange={(value) => setStatusFilter(value as ItemStatus || null)}
            >
              <SelectTrigger>
                <div className="flex items-center gap-1">
                  <Filter className="h-4 w-4" />
                  <span className="truncate">
                    {statusFilter || 'Filtrar por status'}
                  </span>
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os status</SelectItem>
                {Object.values(ItemStatus).map((status) => (
                  <SelectItem key={status} value={status}>
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {(searchQuery || statusFilter) && (
            <Button variant="ghost" onClick={clearFilters}>
              Limpar filtros
            </Button>
          )}
        </div>
      </div>

      {/* Resultados e contador */}
      <div className="mb-4">
        <div className="flex justify-between items-center">
          <Badge variant="outline" className="px-2 py-1">
            {filteredItems.length} itens encontrados
          </Badge>
        </div>
      </div>

      {/* Lista de itens */}
      <div className="mb-6">
        {isCardView ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredItems.map((item) => (
              <ItemCard
                key={item.id}
                item={item}
                onEdit={(item) => handleItemAction('edit', item)}
                onLoan={(item) => handleItemAction('loan', item)}
                onViewDetails={(item) => handleItemAction('details', item)}
              />
            ))}
            {filteredItems.length === 0 && (
              <div className="col-span-full text-center py-12 text-muted-foreground">
                Nenhum item encontrado com os filtros atuais.
              </div>
            )}
          </div>
        ) : (
          <ItemTable
            items={filteredItems}
            onEdit={(item) => handleItemAction('edit', item)}
            onLoan={(item) => handleItemAction('loan', item)}
            onViewDetails={(item) => handleItemAction('details', item)}
            loading={loadingItems}
          />
        )}
      </div>

      {/* Dialogs */}
      <Dialog open={dialogContent.open} onOpenChange={handleDialogClose}>
        <DialogContent className="max-w-3xl">
          {dialogContent.type === 'add' && (
            <>
              <DialogHeader>
                <DialogTitle>Adicionar Novo Item</DialogTitle>
              </DialogHeader>
              <ItemForm onSubmit={handleAddOrUpdateItem} onCancel={handleDialogClose} />
            </>
          )}
          {dialogContent.type === 'edit' && dialogContent.item && (
            <>
              <DialogHeader>
                <DialogTitle>Editar Item</DialogTitle>
              </DialogHeader>
              <ItemForm 
                initialItem={dialogContent.item} 
                onSubmit={handleAddOrUpdateItem} 
                onCancel={handleDialogClose} 
              />
            </>
          )}
          {dialogContent.type === 'loan' && dialogContent.item && (
            <>
              <DialogHeader>
                <DialogTitle>Registrar Empréstimo</DialogTitle>
              </DialogHeader>
              <LoanForm 
                item={dialogContent.item} 
                onSubmit={handleAddLoan} 
                onCancel={handleDialogClose} 
              />
            </>
          )}
          {dialogContent.type === 'details' && dialogContent.item && (
            <ItemDetails 
              item={dialogContent.item} 
              onClose={handleDialogClose} 
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Inventory;
