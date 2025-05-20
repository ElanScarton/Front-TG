import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface Supplier {
  id: string;
  name: string;
  rating: number;
}

interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  thumbnail: string; // dummyjson API uses 'thumbnail' for images
}

const AuctionCreationPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  // State for product and suppliers
  const [product, setProduct] = useState<Product | null>(null);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSuppliers, setSelectedSuppliers] = useState<string[]>([]);
  
  // Form state
  const [auctionData, setAuctionData] = useState({
    title: '',
    description: '',
    maxBudget: 0,
    quantity: 1,
    startDateTime: '',
    duration: 60, // Default duration in minutes
    attachments: [] as File[]
  });

  // Fetch product from dummyjson API and mock suppliers
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Fetch the product from the dummyjson API
        const response = await fetch(`https://dummyjson.com/products/${id}`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch product: ${response.status} ${response.statusText}`);
        }
        
        const productData = await response.json();
        
        // Map the API response to our Product interface
        const fetchedProduct: Product = {
          id: productData.id.toString(),
          title: productData.title,
          description: productData.description,
          price: productData.price,
          thumbnail: productData.thumbnail
        };
        
        setProduct(fetchedProduct);
        
        // Mock suppliers data (we could replace this with another API call if needed)
        const mockSuppliers = [
          { id: 's1', name: 'TechSupply Inc.', rating: 4.8 },
          { id: 's2', name: 'Global Electronics', rating: 4.5 },
          { id: 's3', name: 'Digital Solutions', rating: 4.2 },
          { id: 's4', name: 'Office Depot', rating: 4.0 },
          { id: 's5', name: 'Business Tech', rating: 3.9 }
        ];
        
        setSuppliers(mockSuppliers);
        
        // Pre-fill form with product data
        setAuctionData(prev => ({
          ...prev,
          title: fetchedProduct.title,
          description: fetchedProduct.description,
          maxBudget: fetchedProduct.price,
          startDateTime: getDefaultStartDateTime()
        }));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
        console.error('Error fetching product:', err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [id]);
  
  // Get default start date-time (current time + 1 hour, rounded to nearest hour)
  const getDefaultStartDateTime = () => {
    const date = new Date();
    date.setHours(date.getHours() + 1);
    date.setMinutes(0);
    date.setSeconds(0);
    return date.toISOString().slice(0, 16);
  };

  // Handle supplier selection toggle
  const toggleSupplier = (supplierId: string) => {
    setSelectedSuppliers(prev => 
      prev.includes(supplierId) 
        ? prev.filter(id => id !== supplierId) 
        : [...prev, supplierId]
    );
  };

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setAuctionData(prev => ({
      ...prev,
      [name]: name === 'maxBudget' || name === 'quantity' || name === 'duration' 
        ? parseFloat(value) 
        : value
    }));
  };

  // Handle file upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setAuctionData(prev => ({
        ...prev,
        attachments: [...prev.attachments, ...Array.from(e.target.files || [])]
      }));
    }
  };

  // Remove attachment
  const removeAttachment = (index: number) => {
    setAuctionData(prev => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index)
    }));
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedSuppliers.length === 0) {
      alert('Por favor, selecione pelo menos um fornecedor');
      return;
    }
    
    // Here you would normally send the data to your API
    console.log('Auction data:', {
      ...auctionData,
      productId: product?.id,
      selectedSuppliers,
      createdBy: user?.id
    });
    
    // Show success message and redirect
    alert('Pregão criado com sucesso!');
    navigate('/products');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="bg-red-50 p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-red-700 mb-2">Erro ao carregar o produto</h2>
          <p className="text-red-600">{error}</p>
          <button 
            onClick={() => navigate('/products')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Voltar ao Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-6 bg-gray-50">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md">
        <div className="p-6">
          <h1 className="text-2xl font-bold mb-6 text-gray-800">Criar Pregão Online</h1>
          
          {/* Product info section */}
          {product && (
            <div className="flex items-center p-4 bg-blue-50 rounded-lg mb-6">
              <img 
                src={product.thumbnail} 
                alt={product.title} 
                className="w-20 h-20 object-cover rounded mr-4"
              />
              <div>
                <h2 className="text-lg font-semibold">{product.title}</h2>
                <p className="text-gray-600 text-sm">Preço sugerido: R$ {product.price.toFixed(2)}</p>
              </div>
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Title */}
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Título do Pregão
                </label>
                <input
                  type="text"
                  name="title"
                  value={auctionData.title}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              {/* Description */}
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descrição
                </label>
                <textarea
                  name="description"
                  value={auctionData.description}
                  onChange={handleInputChange}
                  rows={4}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                ></textarea>
              </div>
              
              {/* Max Budget */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Orçamento Máximo (R$)
                </label>
                <input
                  type="number"
                  name="maxBudget"
                  value={auctionData.maxBudget}
                  onChange={handleInputChange}
                  min="0"
                  step="0.01"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              {/* Quantity */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Quantidade
                </label>
                <input
                  type="number"
                  name="quantity"
                  value={auctionData.quantity}
                  onChange={handleInputChange}
                  min="1"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              {/* Start Date and Time */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Data e Hora de Início
                </label>
                <input
                  type="datetime-local"
                  name="startDateTime"
                  value={auctionData.startDateTime}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              {/* Duration */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Duração (minutos)
                </label>
                <select
                  name="duration"
                  value={auctionData.duration}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="30">30 minutos</option>
                  <option value="60">1 hora</option>
                  <option value="120">2 horas</option>
                  <option value="180">3 horas</option>
                  <option value="360">6 horas</option>
                  <option value="720">12 horas</option>
                  <option value="1440">24 horas</option>
                </select>
              </div>
              
              {/* Attachments */}
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Documentos Anexos
                </label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                  <div className="space-y-1 text-center">
                    <svg
                      className="mx-auto h-12 w-12 text-gray-400"
                      stroke="currentColor"
                      fill="none"
                      viewBox="0 0 48 48"
                      aria-hidden="true"
                    >
                      <path
                        d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <div className="flex text-sm text-gray-600">
                      <label
                        htmlFor="file-upload"
                        className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                      >
                        <span>Enviar arquivos</span>
                        <input
                          id="file-upload"
                          name="file-upload"
                          type="file"
                          multiple
                          className="sr-only"
                          onChange={handleFileChange}
                        />
                      </label>
                      <p className="pl-1">ou arraste e solte</p>
                    </div>
                    <p className="text-xs text-gray-500">PDF, DOC, XLS até 10MB</p>
                  </div>
                </div>
                
                {/* Attachment list */}
                {auctionData.attachments.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-gray-700">Arquivos anexados:</h4>
                    <ul className="mt-2 divide-y divide-gray-200 border border-gray-200 rounded-md">
                      {auctionData.attachments.map((file, index) => (
                        <li key={index} className="flex items-center justify-between py-2 px-4">
                          <div className="flex items-center">
                            <svg className="h-5 w-5 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                            </svg>
                            <span className="text-sm text-gray-700 truncate">
                              {file.name}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeAttachment(index)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
            
            {/* Suppliers Selection */}
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-800 mb-2">Selecionar Fornecedores</h3>
              <div className="bg-gray-50 p-4 rounded-md">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {suppliers.map(supplier => (
                    <div 
                      key={supplier.id}
                      className={`flex items-center justify-between p-3 rounded-md cursor-pointer border ${
                        selectedSuppliers.includes(supplier.id) 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'border-gray-300'
                      }`}
                      onClick={() => toggleSupplier(supplier.id)}
                    >
                      <div>
                        <h4 className="font-medium">{supplier.name}</h4>
                        <div className="flex items-center mt-1">
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <svg 
                                key={i} 
                                className={`h-4 w-4 ${i < Math.floor(supplier.rating) ? 'text-yellow-400' : 'text-gray-300'}`} 
                                fill="currentColor" 
                                viewBox="0 0 20 20"
                              >
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                            ))}
                          </div>
                          <span className="text-sm text-gray-500 ml-1">
                            {supplier.rating.toFixed(1)}
                          </span>
                        </div>
                      </div>
                      
                      <div className={`h-6 w-6 rounded-full flex items-center justify-center ${
                        selectedSuppliers.includes(supplier.id) 
                          ? 'bg-blue-500 text-white' 
                          : 'border border-gray-300'
                      }`}>
                        {selectedSuppliers.includes(supplier.id) && (
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Selected suppliers count */}
                <div className="mt-3 text-sm text-gray-600">
                  {selectedSuppliers.length} fornecedor(es) selecionado(s)
                </div>
              </div>
            </div>
            
            {/* Submit button */}
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => navigate('/products')}
                className="py-2 px-4 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="py-2 px-6 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Criar Pregão
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AuctionCreationPage;