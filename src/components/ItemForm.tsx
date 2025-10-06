import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Item, ItemCategory, ItemStatus, ItemDocument } from '@/types';
import { useState, useEffect } from 'react';
import { useInventory } from '@/contexts/InventoryContext';
import { toast } from 'sonner';
import { FileIcon, Upload, X, Loader2, ImageIcon, Image } from 'lucide-react';
import { storageService } from '@/services/storageService';

interface ItemFormProps {
  initialItem?: Item;
  onSubmit: (item: Omit<Item, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
}

const statusOptions = Object.values(ItemStatus);

// Helper function to normalize documents
const normalizeItemDocuments = (docs: any): ItemDocument[] => {
  if (!docs) return [];
  if (Array.isArray(docs)) return docs as ItemDocument[];
  if (typeof docs === 'object' && docs !== null) {
    return Object.values(docs).filter(
      (doc): doc is ItemDocument =>
        typeof doc === 'object' && doc !== null &&
        'id' in doc && 'name' in doc && 'url' in doc && 'type' in doc
    );
  }
  return [];
};

const ItemForm = ({ initialItem, onSubmit, onCancel }: ItemFormProps) => {
  const { categories, locations } = useInventory();
  const [form, setForm] = useState({
    name: initialItem?.name || '',
    description: initialItem?.description || '',
    categoryId: initialItem?.category.id || categories[0]?.id || '',
    quantity: initialItem?.quantity || 0,
    minQuantity: initialItem?.minQuantity || 0,
    unit: initialItem?.unit || 'unidade',
    locationId: initialItem?.locationId || locations[0]?.id || '',
    status: initialItem?.status || ItemStatus.AVAILABLE,
    imageUrl: initialItem?.imageUrl || '',
    documents: normalizeItemDocuments(initialItem?.documents)
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<{ name: string, url: string, type: string }[]>([]);
  const [uploading, setUploading] = useState(false);
  
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(initialItem?.imageUrl || null);
  
  useEffect(() => {
    const initialDocsArray = normalizeItemDocuments(initialItem?.documents);
    if (initialDocsArray.length > 0) {
      setPreviews(initialDocsArray.map(doc => ({
        name: doc.name,
        url: doc.url,
        type: doc.type
      })));
    } else {
      setPreviews([]);
    }
    // Update form state if initialItem changes
    if (initialItem) {
        setForm(prev => ({
            ...prev,
            name: initialItem.name || '',
            description: initialItem.description || '',
            categoryId: initialItem.category.id || categories[0]?.id || '',
            quantity: initialItem.quantity || 0,
            minQuantity: initialItem.minQuantity || 0,
            unit: initialItem.unit || 'unidade',
            locationId: initialItem.locationId || locations[0]?.id || '',
            status: initialItem.status || ItemStatus.AVAILABLE,
            imageUrl: initialItem.imageUrl || '',
            documents: normalizeItemDocuments(initialItem.documents)
        }));
        setImagePreview(initialItem.imageUrl || null);
    } else {
        // Reset form if initialItem is not provided (e.g. for add new)
        // (This part might need adjustment based on how ItemForm is re-used for add/edit)
    }
  }, [initialItem, categories, locations]); // Added categories and locations to dependencies

  const handleChange = (field: string, value: string | number | any[]) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const fileArray = Array.from(files);
      setSelectedFiles(prev => [...prev, ...fileArray]);
      
      fileArray.forEach(file => {
        const fileType = file.type.split('/')[0] === 'image' 
          ? 'image' 
          : file.type === 'application/pdf' 
            ? 'pdf' 
            : 'document';
        
        let previewUrl = '';
        if (fileType === 'image') {
          previewUrl = URL.createObjectURL(file);
        }
        
        setPreviews(prev => [...prev, {
          name: file.name,
          url: previewUrl,
          type: fileType
        }]);
      });
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error("Por favor, selecione uma imagem válida.");
        return;
      }
      
      setSelectedImage(file);
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
      
      if (errors.imageUrl) {
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors.imageUrl;
          return newErrors;
        });
      }
    }
  };

  const removeSelectedImage = () => {
    setSelectedImage(null);
    if (imagePreview && !initialItem?.imageUrl) {
      URL.revokeObjectURL(imagePreview);
    }
    setImagePreview(null);
  };

  const removeFile = (index: number) => {
    const newPreviews = [...previews];
    newPreviews.splice(index, 1);
    setPreviews(newPreviews);
    
    if (index < selectedFiles.length) {
      const newSelectedFiles = [...selectedFiles];
      newSelectedFiles.splice(index, 1);
      setSelectedFiles(newSelectedFiles);
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
    if (!form.locationId) newErrors.locationId = 'Localização é obrigatória';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    const selectedCategory = categories.find(c => c.id === form.categoryId);
    const selectedLocation = locations.find(l => l.id === form.locationId);
    
    if (!selectedCategory) {
      setErrors({ categoryId: 'Categoria não encontrada' });
      return;
    }

    if (!selectedLocation) {
      setErrors({ locationId: 'Localização não encontrada' });
      return;
    }

    try {
      setUploading(true);
      
      const itemId = initialItem?.id || 'temp-' + new Date().getTime();
      
      let currentImageUrl = form.imageUrl; // Start with the current form value
      if (selectedImage) { // If a new image is selected for upload
        const uploadedImage = await storageService.uploadItemFile(selectedImage, `${itemId}/main`);
        currentImageUrl = uploadedImage.url;
      } else if (initialItem?.imageUrl && !imagePreview) { // If existing image was removed (imagePreview is null)
        // TODO: Optionally delete initialItem.imageUrl from storage
        currentImageUrl = '';
      }
      // If no new image selected and existing image not removed, currentImageUrl remains as initialItem.imageUrl (via form.imageUrl)
      
      const uploadPromises = selectedFiles.map(file => 
        storageService.uploadItemFile(file, itemId)
      );
      
      const uploadedDocuments = await Promise.all(uploadPromises);
      
      const initialDocsAsArray = normalizeItemDocuments(initialItem?.documents);
      const existingDocumentsKept = initialDocsAsArray.filter(doc => 
        previews.some(p => p.name === doc.name && p.url === doc.url) && // Check if still in previews (by name and URL)
        !selectedFiles.some(f => f.name === doc.name) // And not re-uploaded
      );
      
      const documentsList = [...existingDocumentsKept, ...uploadedDocuments];

      onSubmit({
        name: form.name,
        description: form.description,
        category: selectedCategory,
        quantity: Number(form.quantity),
        minQuantity: Number(form.minQuantity),
        unit: form.unit,
        locationId: selectedLocation?.id,
        status: form.status,
        imageUrl: currentImageUrl,
        documents: documentsList
      });
      
      toast.success("Arquivos enviados com sucesso!");
    } catch (error) {
      console.error("Erro ao fazer upload dos arquivos:", error);
      toast.error("Erro ao enviar arquivos. Por favor, tente novamente.");
    } finally {
      setUploading(false);
    }
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
          <Select 
            value={form.locationId} 
            onValueChange={(value) => handleChange('locationId', value)}
          >
            <SelectTrigger className={errors.locationId ? 'border-destructive' : ''}>
              <SelectValue placeholder="Selecione uma localização" />
            </SelectTrigger>
            <SelectContent>
              {locations.map((location) => (
                <SelectItem key={location.id} value={location.id}>{location.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.locationId && <p className="text-destructive text-sm">{errors.locationId}</p>}
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

        <div className="space-y-4 md:col-span-2 border rounded-md p-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="main-image">Foto do Item</Label>
            <div className="text-xs text-muted-foreground">
              Adicione uma imagem principal para representar o item
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="border rounded-md overflow-hidden flex-shrink-0" style={{ width: '150px', height: '150px' }}>
              {imagePreview ? (
                <div className="relative h-full">
                  <img 
                    src={imagePreview} 
                    alt="Preview" 
                    className="h-full w-full object-cover"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-1 right-1 h-6 w-6"
                    onClick={removeSelectedImage}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="h-full w-full flex items-center justify-center bg-muted">
                  <ImageIcon className="h-8 w-8 text-muted-foreground" />
                </div>
              )}
            </div>
            
            <div className="flex-grow">
              <div className="border-2 border-dashed rounded-md p-6 flex flex-col items-center justify-center text-center">
                <Image className="h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground mb-2">
                  Selecione uma imagem para o item
                </p>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={() => document.getElementById('item-image')?.click()}
                >
                  Escolher Imagem
                </Button>
                <Input
                  id="item-image"
                  type="file"
                  className="hidden"
                  onChange={handleImageChange}
                  accept="image/*"
                />
                <p className="text-xs text-muted-foreground mt-2">
                  PNG, JPG ou JPEG (máx. 5MB)
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4 md:col-span-2 border rounded-md p-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="documents">Documentos</Label>
            <div className="text-xs text-muted-foreground">
              Adicione PDFs, imagens ou outros documentos relevantes
            </div>
          </div>

          <div className="border-2 border-dashed rounded-md p-6 flex flex-col items-center justify-center text-center">
            <Upload className="h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground mb-2">
              Arraste arquivos aqui ou clique para selecionar
            </p>
            <Button 
              type="button" 
              variant="outline" 
              size="sm"
              onClick={() => document.getElementById('file-upload')?.click()}
            >
              Selecionar Arquivos
            </Button>
            <Input
              id="file-upload"
              type="file"
              multiple
              className="hidden"
              onChange={handleFileChange}
              accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.xls,.xlsx"
            />
          </div>

          {previews.length > 0 && (
            <div className="mt-4 space-y-2">
              <Label>Arquivos selecionados ({previews.length})</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {previews.map((file, index) => (
                  <div 
                    key={index} 
                    className="flex items-center justify-between p-2 border rounded-md"
                  >
                    <div className="flex items-center gap-2 overflow-hidden">
                      {file.type === 'image' && file.url ? (
                        <div className="h-8 w-8 rounded overflow-hidden flex-shrink-0">
                          <img 
                            src={file.url} 
                            alt={file.name} 
                            className="h-full w-full object-cover"
                          />
                        </div>
                      ) : (
                        <FileIcon className="h-6 w-6 text-primary flex-shrink-0" />
                      )}
                      <div className="overflow-hidden">
                        <p className="text-sm truncate" title={file.name}>
                          {file.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {file.type}
                        </p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0 flex-shrink-0"
                      onClick={() => removeFile(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" disabled={uploading}>
          {uploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Enviando...
            </>
          ) : (
            <>{initialItem ? 'Atualizar' : 'Cadastrar'} Item</>
          )}
        </Button>
      </div>
    </form>
  );
};

export default ItemForm;

