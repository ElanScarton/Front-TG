import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { getProducts } from '../../services/productService';
import { getUsuarios } from '../../services/usuarioService';
import { createLeilao, assignSuppliersToAuction } from '../../services/auctionService';

interface Fornecedor {
  id: number;
  nome: string;
  email: string;
  cnpj: string;
  tipoUsuario: string;
  ativo: boolean;
  rating: number;
}

interface Product {
  id: number;
  nome: string;
  quantidade: number;
  valor: number;
  descricao: string;
  area: string;
  ativo: boolean;
  dataCriacao: string;
  dataAtualizacao: string;
  thumbnail?: string;
}

const AuctionCreationPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [product, setProduct] = useState<Product | null>(null);
  const [suppliers, setSuppliers] = useState<Fornecedor[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedSuppliers, setSelectedSuppliers] = useState<number[]>([]);

  const [auctionData, setAuctionData] = useState({
    title: '',
    description: '',
    maxBudget: 0,
    quantity: 1,
    startDateTime: '',
    duration: 60,
    attachments: [] as File[]
  });

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const products = await getProducts();
        const foundProduct = products.find((p: Product) => p.id === Number(id));

        if (!foundProduct) {
          throw new Error('Produto não encontrado');
        }

        setProduct(foundProduct);

        const usuarios = await getUsuarios();
        console.log(usuarios)
        const fornecedores = usuarios
          .filter((usuario: any) => usuario.tipoUsuario === 1)
          .map((fornecedor: any) => ({
            id: fornecedor.id,
            nome: fornecedor.nome,
            email: fornecedor.email,
            cnpj: fornecedor.cnpj,
            tipoUsuario: fornecedor.tipoUsuario,
            ativo: fornecedor.ativo,
            rating: fornecedor.rating || 0
          }));
          console.log(fornecedores)

        setSuppliers(fornecedores);

        // Pre-fill form with product data
        setAuctionData(prev => ({
          ...prev,
          title: `Pregão para ${foundProduct.nome}`,
          description: foundProduct.descricao,
          maxBudget: foundProduct.valor,
          quantity: Math.min(foundProduct.quantidade, 1),
          startDateTime: getDefaultStartDateTime()
        }));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro desconhecido ao carregar dados');
        console.error('Erro ao buscar dados:', err);
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchData();
    }
  }, [id]);

  // Get default start date-time (current time + 1 hour, rounded to nearest hour)
  const getDefaultStartDateTime = () => {
    const date = new Date();
    date.setHours(date.getHours() + 1);
    date.setMinutes(0);
    date.setSeconds(0);
    return date.toISOString().slice(0, 16);
  };

  // Calculate end date based on start date and duration
  const calculateEndDateTime = (startDateTime: string, durationMinutes: number) => {
    const startDate = new Date(startDateTime);
    const endDate = new Date(startDate.getTime() + durationMinutes * 60000);
    return endDate.toISOString();
  };

  // Handle supplier selection toggle
  const toggleSupplier = (supplierId: number) => {
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
        ? parseFloat(value) || 0
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

  // Format currency for display
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  // Validate form data
  const validateForm = () => {
    if (!auctionData.title.trim()) {
      alert('Por favor, preencha o título do pregão');
      return false;
    }

    if (!auctionData.description.trim()) {
      alert('Por favor, preencha a descrição do pregão');
      return false;
    }

    if (auctionData.maxBudget <= 0) {
      alert('Por favor, defina um orçamento máximo válido');
      return false;
    }

    if (auctionData.quantity <= 0 || auctionData.quantity > (product?.quantidade || 0)) {
      alert(`Quantidade deve ser entre 1 e ${product?.quantidade || 0}`);
      return false;
    }

    if (!auctionData.startDateTime) {
      alert('Por favor, defina a data e hora de início');
      return false;
    }

    if (new Date(auctionData.startDateTime) <= new Date()) {
      alert('A data de início deve ser no futuro');
      return false;
    }

    if (selectedSuppliers.length === 0) {
      alert('Por favor, selecione pelo menos um fornecedor');
      return false;
    }

    return true;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Calculate end date and delivery date
      const dataInicio = new Date(auctionData.startDateTime).toISOString();
      const dataTermino = calculateEndDateTime(auctionData.startDateTime, auctionData.duration);
      
      // Set delivery date as 7 days after auction end
      const deliveryDate = new Date(dataTermino);
      deliveryDate.setDate(deliveryDate.getDate() + 7);
      const dataEntrega = deliveryDate.toISOString();

      // Prepare leilao data for API
      const leilaoData = {
        titulo: auctionData.title,
        descricao: auctionData.description,
        precoInicial: auctionData.maxBudget,
        dataInicio: dataInicio,
        dataTermino: dataTermino,
        dataEntrega: dataEntrega,
        produtoId: product?.id || 0,
        usuarioId: user?.id
      };  

      console.log('Criando leilão com dados:', leilaoData);

      // Create the auction via API
      const createdLeilao = await createLeilao(leilaoData);

      console.log('Leilão criado com sucesso:', createdLeilao);

      // Assign selected suppliers to the auction
      if (selectedSuppliers.length > 0 && createdLeilao.id) {
          console.log('Atribuindo fornecedores ao leilão:', selectedSuppliers);
          try {
          await assignSuppliersToAuction(createdLeilao.id, selectedSuppliers);
          console.log('Fornecedores atribuídos com sucesso');
        } catch (error) {
          console.error('Erro ao atribuir fornecedores:', error);
          throw new Error(`Leilão criado, mas falha ao atribuir fornecedores: ${
            error instanceof Error ? error.message : 'Erro desconhecido'
          }`);
        }
      }

      // Show success message
      alert('Pregão criado com sucesso!');

      // Navigate back to products page
      navigate(`/products`);

    } catch (error) {
      console.error('Erro ao criar pregão:', error);
      
      // Show error message to user
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Erro desconhecido ao criar pregão';
      
      alert(`Erro ao criar pregão: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
          <div className="flex-1 p-6 bg-gray-100">
            <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md"></div>
              <div className="flex items-center justify-center min-h-screen bg-gray-100">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-black mx-auto mb-4"></div>
                  <h2 className="text-xl font-semibold text-gray-700">Carregando dados...</h2>
                </div>
              </div>
            </div>
    );
  }

  if (error || !product) {
    return (
          <div className="flex-1 p-6 bg-gray-100">
            <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md"></div>
              <div className="flex items-center justify-center min-h-screen bg-gray-100">
                <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full mx-4">
                  <div className="text-gray-600 text-6xl text-center mb-4">⚠️</div>
                  <h2 className="text-xl font-semibold text-gray-800 mb-2 text-center">Erro ao carregar dados</h2>
                  <p className="text-gray-600 text-center mb-6">{error}</p>
                  <div className="flex gap-3">
                    <button
                      onClick={() => navigate('/products')}
                      className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                    >
                      Voltar aos Produtos
                    </button>
                    <button
                      onClick={() => window.location.reload()}
                      className="flex-1 px-4 py-2 border border-gray-300 text-gray-600 rounded-md hover:bg-gray-200 transition-colors"
                    >
                      Tentar Novamente
                    </button>
                  </div>
                </div>
              </div>
            </div>
    );
  }

  return (
    <div className="flex-1 p-6 bg-gray-100">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md">
        <div className="p-6">
          <h1 className="text-2xl font-bold mb-6 text-gray-800">Criar Pregão Online</h1>

          {/* Product info section */}
          {product && (
            <div className="flex items-center p-4 bg-gray-200 rounded-lg mb-6">
              <a className="w-20 h-20 object-cover rounded mr-4">
              {product.nome}
              </a>
              <div>
                <h2 className="text-lg font-semibold text-gray-800">{product.nome}</h2>
                <p className="text-gray-600 text-sm">Preço sugerido: {formatCurrency(product.valor)}</p>
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
                  disabled={isSubmitting}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 disabled:bg-gray-100 disabled:cursor-not-allowed"
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
                  disabled={isSubmitting}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 disabled:bg-gray-100 disabled:cursor-not-allowed"
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
                  disabled={isSubmitting}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 disabled:bg-gray-100 disabled:cursor-not-allowed"
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
                  disabled={isSubmitting}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 disabled:bg-gray-100 disabled:cursor-not-allowed"
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
                  disabled={isSubmitting}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 disabled:bg-gray-100 disabled:cursor-not-allowed"
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
                  disabled={isSubmitting}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 disabled:bg-gray-100 disabled:cursor-not-allowed"
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
                      className="mx-auto h-12 w-12 text-gray-600"
                      stroke="currentColor"
                      fill="none"
                      viewBox="0 0 48 48"
                      aria-hidden="true"
                    >
                      <path
                        d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-Runs4v8m-12 4h.02"
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <div className="flex text-sm text-gray-600">
                      <label
                        htmlFor="file-upload"
                        className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-700 focus-within:outline-none focus-within:ring-2 focus-within:ring-blue-600"
                      >
                        <span>Enviar arquivos</span>
                        <input
                          id="file-upload"
                          name="file-upload"
                          type="file"
                          multiple
                          disabled={isSubmitting}
                          className="sr-only"
                          onChange={handleFileChange}
                        />
                      </label>
                      <p className="pl-1">ou arraste e solte</p>
                    </div>
                    <p className="text-xs text-gray-600">PDF, DOC, XLS até 10MB</p>
                  </div>
                </div>

                {/* Attachment list */}
                {auctionData.attachments.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-gray-700">Arquivos anexados:</h4>
                    <ul className="mt-2 divide-y divide-gray-200 border border-gray-300 rounded-md">
                      {auctionData.attachments.map((file, index) => (
                        <li key={index} className="flex items-center justify-between py-2 px-4">
                          <div className="flex items-center">
                            <svg className="h-5 w-5 text-gray-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                            </svg>
                            <span className="text-sm text-gray-700 truncate">{file.name}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeAttachment(index)}
                            disabled={isSubmitting}
                            className="text-gray-600 hover:text-black disabled:cursor-not-allowed"
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
              <div className="bg-gray-200 p-4 rounded-md">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {suppliers.map(supplier => (
                    <div
                      key={supplier.id}
                      className={`flex items-center justify-between p-3 rounded-md cursor-pointer border ${
                        selectedSuppliers.includes(supplier.id)
                          ? 'border-blue-600 bg-blue-100'
                          : 'border-gray-300'
                      } ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                      onClick={() => !isSubmitting && toggleSupplier(supplier.id)}
                    >
                      <div>
                        <h4 className="font-medium text-gray-800">{supplier.nome}</h4>
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
                          <span className="text-sm text-gray-600 ml-1">{supplier.rating.toFixed(1)}</span>
                        </div>
                      </div>
                      <div className={`h-6 w-6 rounded-full flex items-center justify-center ${
                        selectedSuppliers.includes(supplier.id)
                          ? 'bg-blue-600 text-white'
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
                disabled={isSubmitting}
                className="py-2 px-4 border border-gray-300 rounded-md text-sm font-medium text-gray-600 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="py-2 px-6 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Criando...
                  </>
                ) : (
                  'Criar Pregão'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AuctionCreationPage;