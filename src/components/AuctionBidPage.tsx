import React, { useState, useEffect } from 'react';
import { Clock, Upload, Users, DollarSign, Calendar, ChevronLeft, Info, AlertTriangle } from 'lucide-react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

const AuctionBidPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // States
  const [auction, setAuction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [bidValue, setBidValue] = useState('');
  const [deliveryDate, setDeliveryDate] = useState(() => {
    // Default delivery date: 7 days from now
    const date = new Date();
    date.setDate(date.getDate() + 7);
    return date.toISOString().split('T')[0];
  });
  const [description, setDescription] = useState('');
  const [fileNames, setFileNames] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState('');
  const [activeTab, setActiveTab] = useState('auction');

  // Fetch auction data
  useEffect(() => {
    const fetchAuctionData = async () => {
      setLoading(true);
      try {
        // Fetch the specific product by ID
        const response = await axios.get(`https://dummyjson.com/products/${id}`);
        const product = response.data;
        
        // Generate auction data based on product
        const now = new Date();
        const startDateTime = new Date(now.getTime() - 1000 * 60 * 60); // Started 1 hour ago
        const endTime = new Date(now.getTime() + 1000 * 60 * 60 * 5); // Ends in 5 hours
        
        const auctionData = {
          id: product.id.toString(),
          title: product.title,
          description: product.description,
          maxBudget: Math.round(product.price * 1.2 * 100) / 100, // Set max budget slightly higher than product price
          quantity: Math.floor(Math.random() * 10) + 1, // Random quantity 1-10
          startDateTime: startDateTime.toISOString(),
          endTime: endTime.toISOString(),
          thumbnail: product.thumbnail,
          status: 'active',
          bidsCount: Math.floor(Math.random() * 15), // Random number of bids
          createdBy: {
            name: `Cliente ${Math.floor(Math.random() * 100)}`,
            rating: (3 + Math.random() * 2).toFixed(1) // Rating between 3 and 5
          }
        };
        
        setAuction(auctionData);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching auction:', err);
        setError(err instanceof Error ? err.message : 'Ocorreu um erro ao carregar os dados do pregão');
        setLoading(false);
      }
    };

    if (id) {
      fetchAuctionData();
    }
  }, [id]);

  // Update time remaining every second
  useEffect(() => {
    if (!auction) return;
    
    const interval = setInterval(() => {
      const end = new Date(auction.endTime);
      const now = new Date();
      const diffMs = end.getTime() - now.getTime();
      
      if (diffMs < 0) {
        setTimeRemaining('Encerrado');
        clearInterval(interval);
        return;
      }
      
      const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
      const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      const diffSecs = Math.floor((diffMs % (1000 * 60)) / 1000);
      
      setTimeRemaining(`${diffHrs}h ${diffMins}m ${diffSecs}s`);
    }, 1000);
    
    return () => clearInterval(interval);
  }, [auction]);

  // Handlers
  const handleFileSelection = () => {
    // Simulate adding files
    const mockFiles = ['especificacao_tecnica.pdf', 'catalogo_produtos.pdf', 'certificado_garantia.jpg'];
    setFileNames(mockFiles);
  };

  const handleRemoveFile = (index) => {
    setFileNames(fileNames.filter((_, i) => i !== index));
  };

  const handleSubmitBid = (e) => {
    e.preventDefault();
    
    if (!auction) return;
    
    if (bidValue === '' || !deliveryDate || !description) {
      setErrorMessage('Por favor, preencha todos os campos obrigatórios.');
      return;
    }
    
    if (parseFloat(bidValue) > auction.maxBudget) {
      setErrorMessage(`O valor do lance não pode ser maior que o orçamento máximo (R$ ${auction.maxBudget.toFixed(2)}).`);
      return;
    }
    
    setIsSubmitting(true);
    setErrorMessage(null);
    
    // Simulate API call with timeout
    setTimeout(() => {
      setSuccessMessage('Seu lance foi registrado com sucesso!');
      setIsSubmitting(false);
      
      // Reset form
      setBidValue('');
      setDescription('');
      setFileNames([]);
      
      // Redirect after successful submission
      setTimeout(() => {
        navigate('/list');
      }, 3000);
    }, 1500);
  };

  // Mock navigation
  const navigateBack = () => {
    navigate('/list');
  };

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR') + ' ' + date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex-1 bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Error state
  if (error || !auction) {
    return (
      <div className="flex-1 bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6">
            <button 
              onClick={navigateBack}
              className="flex items-center text-black hover:text-blue-800"
            >
              <ChevronLeft className="h-5 w-5 mr-1" />
              Voltar para a lista de pregões
            </button>
          </div>
          
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            <div className="flex">
              <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
              <div>
                <p className="font-medium">Erro ao carregar o pregão</p>
                <p>{error || 'O pregão solicitado não foi encontrado.'}</p>
                <button 
                  onClick={() => window.location.reload()}
                  className="mt-2 px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
                >
                  Tentar novamente
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-6">
          <button 
            onClick={navigateBack}
            className="flex items-center text-black hover:text-blue-800"
          >
            <ChevronLeft className="h-5 w-5 mr-1" />
            Voltar para a lista de pregões
          </button>
        </div>

        {/* Success message */}
        {successMessage && (
          <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
            <div className="flex">
              <div className="py-1">
                <svg className="h-6 w-6 text-green-500 mr-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <p className="font-medium">{successMessage}</p>
                <p className="text-sm">Você será redirecionado para a lista de pregões em instantes.</p>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Auction Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col md:flex-row md:justify-between md:items-start">
              <div>
                <h1 className="text-2xl font-bold text-gray-800 mb-2">{auction.title}</h1>
                <div className="flex items-center text-gray-600 text-sm mb-1">
                  <Users className="h-4 w-4 mr-1" />
                  <span>Cliente: {auction.createdBy.name}</span>
                </div>
                <div className="flex items-center text-gray-600 text-sm">
                  <span className="mr-1">Avaliação:</span>
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <svg 
                        key={i} 
                        className={`h-4 w-4 ${i < Math.floor(Number(auction.createdBy.rating)) ? 'text-yellow-400' : 'text-gray-300'}`} 
                        fill="currentColor" 
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                    <span className="ml-1 text-gray-600">{auction.createdBy.rating}</span>
                  </div>
                </div>
              </div>
              <div className="text-left md:text-right mt-4 md:mt-0">
                <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium inline-block mb-2">
                  <Clock className="h-4 w-4 inline-block mr-1" />
                  {timeRemaining}
                </div>
                <div className="text-gray-600 text-sm">
                  <p>Iniciado em: {formatDate(auction.startDateTime)}</p>
                  <p>Término em: {formatDate(auction.endTime)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Tab navigation */}
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab('auction')}
                className={`py-4 px-6 font-medium text-sm border-b-2 ${
                  activeTab === 'auction'
                    ? 'border-blue-500 text-black'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Detalhes do Pregão
              </button>
              <button
                onClick={() => setActiveTab('bid')}
                className={`py-4 px-6 font-medium text-sm border-b-2 ${
                  activeTab === 'bid'
                    ? 'border-blue-500 text-black'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Enviar Lance
              </button>
            </nav>
          </div>

          {/* Tab content */}
          <div className="p-6">
            {activeTab === 'auction' ? (
              <div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <img 
                      src={auction.thumbnail}
                      alt={auction.title} 
                      className="w-full h-64 object-cover rounded-lg"
                    />
                    
                    <div className="mt-6">
                      <h3 className="text-lg font-semibold mb-2">Detalhes do Pregão</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <p className="text-sm text-gray-500 mb-1">Orçamento Máximo</p>
                          <p className="text-xl font-bold text-black">R$ {auction.maxBudget.toFixed(2)}</p>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <p className="text-sm text-gray-500 mb-1">Quantidade</p>
                          <p className="text-xl font-bold">{auction.quantity} unidades</p>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <p className="text-sm text-gray-500 mb-1">Total de Lances</p>
                          <p className="text-xl font-bold">{auction.bidsCount}</p>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <p className="text-sm text-gray-500 mb-1">Status</p>
                          <p className="text-xl font-bold text-green-600">Ativo</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Descrição</h3>
                    <div className="bg-gray-50 p-4 rounded-lg mb-6">
                      <p className="text-gray-700">{auction.description}</p>
                    </div>
                    
                    <h3 className="text-lg font-semibold mb-3">Informações Adicionais</h3>
                    <div className="bg-gray-50 p-4 rounded-lg mb-6">
                      <div className="flex items-start mb-3">
                        <Info className="h-5 w-5 text-blue-500 mr-2 mt-0.5" />
                        <div>
                          <p className="font-medium">Entrega Estimada</p>
                          <p className="text-gray-600 text-sm">O cliente espera receber os itens em até 15 dias após o fechamento do pregão.</p>
                        </div>
                      </div>
                      <div className="flex items-start mb-3">
                        <Info className="h-5 w-5 text-blue-500 mr-2 mt-0.5" />
                        <div>
                          <p className="font-medium">Garantia</p>
                          <p className="text-gray-600 text-sm">É necessário oferecer garantia mínima de 90 dias para os produtos.</p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <Info className="h-5 w-5 text-blue-500 mr-2 mt-0.5" />
                        <div>
                          <p className="font-medium">Pagamento</p>
                          <p className="text-gray-600 text-sm">O pagamento será realizado em até 30 dias após a entrega e aprovação dos itens.</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-6">
                      <button 
                        onClick={() => setActiveTab('bid')}
                        className="w-full py-3 px-4 bg-black text-white font-medium rounded-lg hover:bg-blue-700 transition duration-150"
                      >
                        Participar deste Pregão
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div>
                {/* Bid submission form */}
                <form onSubmit={handleSubmitBid}>
                  {errorMessage && (
                    <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                      <div className="flex">
                        <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
                        <span>{errorMessage}</span>
                      </div>
                    </div>
                  )}
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <div className="mb-5">
                        <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="bidValue">
                          Valor do Lance (R$) *
                        </label>
                        <div className="relative rounded-md shadow-sm">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <DollarSign className="h-5 w-5 text-gray-400" />
                          </div>
                          <input
                            type="number"
                            id="bidValue"
                            name="bidValue"
                            min="0"
                            step="0.01"
                            required
                            value={bidValue}
                            onChange={(e) => setBidValue(e.target.value)}
                            className="block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            placeholder="0,00"
                          />
                          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                            <span className="text-gray-500 sm:text-sm">BRL</span>
                          </div>
                        </div>
                        {bidValue && parseFloat(bidValue) > auction.maxBudget && (
                          <p className="mt-1 text-sm text-red-600">
                            O valor não pode exceder o orçamento máximo de R$ {auction.maxBudget.toFixed(2)}
                          </p>
                        )}
                        <p className="mt-1 text-sm text-gray-500">
                          Orçamento máximo: R$ {auction.maxBudget.toFixed(2)}
                        </p>
                      </div>
                      
                      <div className="mb-5">
                        <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="deliveryDate">
                          Data de Entrega *
                        </label>
                        <div className="relative rounded-md shadow-sm">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Calendar className="h-5 w-5 text-gray-400" />
                          </div>
                          <input
                            type="date"
                            id="deliveryDate"
                            name="deliveryDate"
                            required
                            value={deliveryDate}
                            onChange={(e) => setDeliveryDate(e.target.value)}
                            className="block w-full pl-10 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                        <p className="mt-1 text-sm text-gray-500">
                          Data estimada para entrega dos itens
                        </p>
                      </div>
                      
                      <div className="mb-5">
                        <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="attachments">
                          Anexos (Opcional)
                        </label>
                        <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                          <div className="space-y-1 text-center">
                            <Upload className="mx-auto h-12 w-12 text-gray-400" />
                            <div className="flex text-sm text-gray-600">
                              <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-black hover:text-blue-500">
                                <span>Escolher arquivos</span>
                                <button 
                                  type="button" 
                                  onClick={handleFileSelection}
                                  className="sr-only"
                                >
                                  Selecionar arquivos
                                </button>
                              </label>
                              <p className="pl-1">ou arraste e solte aqui</p>
                            </div>
                            <p className="text-xs text-gray-500">
                              PDF, Word, Excel, JPG ou PNG até 10MB
                            </p>
                          </div>
                        </div>
                        
                        {/* Attached files preview */}
                        {fileNames.length > 0 && (
                          <div className="mt-3">
                            <h4 className="text-sm font-medium text-gray-700 mb-2">Arquivos anexados:</h4>
                            <ul className="space-y-2">
                              {fileNames.map((fileName, index) => (
                                <li key={index} className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-md text-sm">
                                  <span className="truncate">{fileName}</span>
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveFile(index)}
                                    className="ml-2 text-red-500 hover:text-red-700"
                                  >
                                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                  </button>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <div className="mb-5">
                        <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="description">
                          Descrição da Proposta *
                        </label>
                        <textarea
                          id="description"
                          name="description"
                          rows={10}
                          required
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          className="block w-full py-3 px-4 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Descreva detalhes sobre os produtos que está oferecendo, incluindo marca, modelo, especificações técnicas, garantia e outras informações relevantes."
                        />
                        <p className="mt-1 text-sm text-gray-500">
                          Forneça detalhes completos para aumentar suas chances de aprovação
                        </p>
                      </div>
                      
                      <div className="bg-yellow-50 p-4 rounded-lg mb-6">
                        <div className="flex">
                          <AlertTriangle className="h-5 w-5 text-yellow-400 mr-2" />
                          <div>
                            <h3 className="text-sm font-medium text-yellow-800">Atenção</h3>
                            <div className="mt-2 text-sm text-yellow-700">
                              <p>Ao submeter seu lance, você concorda com os termos e condições do pregão e confirma que poderá entregar os itens conforme as especificações e no prazo indicado.</p>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex justify-end">
                        <button
                          type="button"
                          onClick={() => setActiveTab('auction')}
                          className="mr-3 px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
                        >
                          Voltar
                        </button>
                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className="px-4 py-2 bg-black text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center"
                        >
                          {isSubmitting ? (
                            <>
                              <span className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full"></span>
                              Enviando...
                            </>
                          ) : (
                            'Enviar Lance'
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuctionBidPage;