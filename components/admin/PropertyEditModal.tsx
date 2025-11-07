
import React, { useState, useEffect } from 'react';
import type { Property, PropertyType } from '../../types';
import { CloseIcon, CrownIcon, BotIcon, ImageIcon, TrashIcon } from '../Icons';
import { addProperty, updateProperty, getLocations } from '../../services/storageService';
import { generatePropertyDescription } from '../../services/geminiService';
import { PROPERTY_TYPES } from '../../constants';

interface PropertyEditModalProps {
  property: Property | null;
  onClose: () => void;
  onSave: () => void;
}

export const PropertyEditModal: React.FC<PropertyEditModalProps> = ({ property, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: property?.name || '',
    type: property?.type || 'Apartamento',
    location: property?.location || '',
    price: property?.price || 0,
    transactionType: property?.transactionType || 'Venda',
    description: property?.description || '',
    features: property?.features?.join(', ') || '',
    isVip: property?.isVip || false,
  });

  const [imageList, setImageList] = useState<(string | File)[]>([]);
  const [locations, setLocations] = useState<string[]>([]);
  const [isGeneratingDesc, setIsGeneratingDesc] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setLocations(getLocations());
    if (property?.images) {
        setImageList(property.images);
    }
    // if creating a new property, and locations exist, default to the first one
    if (!property && getLocations().length > 0) {
        setFormData(prev => ({...prev, location: getLocations()[0]}));
    }
  }, [property]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
        setFormData(prev => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }));
    } else {
        setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let { value } = e.target;
    value = value.replace(/\D/g, '');
    
    if (value === '') {
        setFormData(prev => ({ ...prev, price: 0 }));
        return;
    }
    
    const numericValue = Number(value) / 100;
    setFormData(prev => ({ ...prev, price: numericValue }));
  };
  
  const formatPriceForInput = (price: number) => {
    if (!price || isNaN(price) || price === 0) return '';
    return new Intl.NumberFormat('pt-BR', {
      minimumFractionDigits: 2,
    }).format(price);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
        const files = Array.from(e.target.files);
        setImageList(prev => [...prev, ...files]);
    }
  };

  const handleRemoveImage = (indexToRemove: number) => {
    setImageList(prev => prev.filter((_, index) => index !== indexToRemove));
    // Reset file input value to allow re-uploading the same file
    const fileInput = document.getElementById('imageUpload') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const uploadedImageUrls = await Promise.all(
        imageList.map(image => {
            if (typeof image === 'string') {
                return Promise.resolve(image); // It's an existing base64 URL
            }
            return new Promise<string>((resolve, reject) => {
                const reader = new FileReader();
                reader.readAsDataURL(image);
                reader.onload = () => resolve(reader.result as string);
                reader.onerror = error => reject(error);
            });
        })
    );
    
    const propertyData = {
        ...formData,
        features: formData.features.split(',').map(f => f.trim()).filter(f => f),
        images: uploadedImageUrls,
    };

    if (property) {
      updateProperty(property.id, propertyData);
    } else {
      addProperty(propertyData);
    }
    setIsSubmitting(false);
    onSave();
  };

  const handleGenerateDescription = async () => {
    setIsGeneratingDesc(true);
    const originalDesc = formData.description;
    setFormData(prev => ({...prev, description: 'Gerando descrição, por favor aguarde...'}));
    try {
        const detailsToGenerate: Partial<Property> = {
            name: formData.name,
            type: formData.type as PropertyType,
            location: formData.location,
            price: formData.price,
            transactionType: formData.transactionType as 'Venda' | 'Aluguel' | 'Temporada',
            features: formData.features.split(',').map(f => f.trim()).filter(f => f),
        };
        const generatedDesc = await generatePropertyDescription(detailsToGenerate);
        setFormData(prev => ({...prev, description: generatedDesc}));
    } catch(e) {
        setFormData(prev => ({...prev, description: originalDesc}));
        // Optional: show an error message
    } finally {
        setIsGeneratingDesc(false);
    }
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-2xl p-6 md:p-8 w-full max-w-2xl relative flex flex-col max-h-[90vh]">
        <button type="button" onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
          <CloseIcon />
        </button>
        
        <h2 className="text-2xl font-bold text-brand-dark mb-6">{property ? 'Editar Imóvel' : 'Adicionar Novo Imóvel'}</h2>

        <div className="flex-1 overflow-y-auto pr-2 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nome do Imóvel</label>
            <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} required className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary" />
          </div>
          
          <div>
            <label htmlFor="type" className="block text-sm font-medium text-gray-700">Tipo</label>
            <select name="type" id="type" value={formData.type} onChange={handleChange} required className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary">
              {PROPERTY_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
            </select>
          </div>

          <div>
            <label htmlFor="location" className="block text-sm font-medium text-gray-700">Localidade</label>
            <select name="location" id="location" value={formData.location} onChange={handleChange} required className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary">
              {locations.map(loc => <option key={loc} value={loc}>{loc}</option>)}
            </select>
          </div>

           <div>
            <label htmlFor="transactionType" className="block text-sm font-medium text-gray-700">Tipo de Transação</label>
            <select name="transactionType" id="transactionType" value={formData.transactionType} onChange={handleChange} required className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary">
              <option value="Venda">Venda</option>
              <option value="Aluguel">Aluguel</option>
              <option value="Temporada">Temporada</option>
            </select>
          </div>

          <div>
            <label htmlFor="price" className="block text-sm font-medium text-gray-700">Preço</label>
             <div className="relative mt-1">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <span className="text-gray-500 sm:text-sm">R$</span>
                </div>
                <input 
                    type="text" 
                    name="price" 
                    id="price" 
                    value={formatPriceForInput(formData.price)} 
                    onChange={handlePriceChange} 
                    required 
                    className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary" 
                    placeholder="0,00"
                />
            </div>
          </div>

          <div className="md:col-span-2">
            <div className="flex justify-between items-center">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">Descrição</label>
                <button 
                    type="button" 
                    onClick={handleGenerateDescription}
                    disabled={isGeneratingDesc || !formData.name}
                    className="flex items-center gap-1 text-xs bg-brand-accent-light text-brand-accent-dark font-semibold py-1 px-2 rounded-md hover:bg-brand-accent/20 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <BotIcon /> {isGeneratingDesc ? 'Gerando...' : 'Gerar com IA ✨'}
                </button>
            </div>
            <textarea name="description" id="description" value={formData.description} onChange={handleChange} rows={5} className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary" />
          </div>

          <div className="md:col-span-2">
            <label htmlFor="features" className="block text-sm font-medium text-gray-700">Características</label>
            <input type="text" name="features" id="features" value={formData.features} onChange={handleChange} placeholder="Piscina, Vista Mar, Garagem" className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary" />
            <p className="text-xs text-gray-500 mt-1">Separadas por vírgula.</p>
          </div>
          
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700">Imagens</label>
            <div className="mt-2 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                {imageList.map((image, index) => (
                    <div key={index} className="relative aspect-square group">
                        <img
                            src={typeof image === 'string' ? image : URL.createObjectURL(image)}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-full object-cover rounded-md"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all flex items-center justify-center">
                            <button
                                type="button"
                                onClick={() => handleRemoveImage(index)}
                                className="h-7 w-7 flex items-center justify-center bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity transform scale-75 group-hover:scale-100"
                                aria-label="Remover Imagem"
                            >
                                <TrashIcon />
                            </button>
                        </div>
                    </div>
                ))}
                 <label htmlFor="imageUpload" className="cursor-pointer aspect-square flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-md hover:border-brand-primary text-gray-500 hover:text-brand-primary transition-colors">
                    <ImageIcon />
                    <span className="text-xs mt-1">Adicionar</span>
                    <input
                        id="imageUpload"
                        type="file"
                        multiple
                        accept="image/png, image/jpeg, image/webp"
                        className="hidden"
                        onChange={handleImageChange}
                    />
                </label>
            </div>
          </div>
          
          <div className="md:col-span-2 flex items-center gap-3 bg-brand-accent-light p-3 rounded-md border border-brand-accent">
            <input 
                type="checkbox" 
                name="isVip" 
                id="isVip" 
                checked={formData.isVip} 
                onChange={handleChange}
                className="h-5 w-5 rounded border-gray-300 text-brand-accent focus:ring-brand-accent"
            />
            <div>
                <label htmlFor="isVip" className="font-medium text-gray-800 flex items-center gap-1"><CrownIcon className="h-4 w-4 text-brand-accent-dark"/>Imóvel VIP</label>
                <p className="text-xs text-gray-600">Marque para destacar este imóvel como exclusivo para membros VIP.</p>
            </div>
          </div>

        </div>

        <div className="flex-shrink-0 pt-6 mt-auto flex justify-end gap-2">
            <button type="button" onClick={onClose} className="bg-gray-200 text-gray-800 font-bold py-2 px-6 rounded-md hover:bg-gray-300 transition-colors">
                Cancelar
            </button>
             <button type="submit" disabled={isSubmitting} className="bg-brand-secondary text-white font-bold py-2 px-6 rounded-md hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-wait">
                {isSubmitting ? 'Salvando...' : (property ? 'Salvar Alterações' : 'Salvar Imóvel')}
            </button>
        </div>
      </form>
    </div>
  );
};
