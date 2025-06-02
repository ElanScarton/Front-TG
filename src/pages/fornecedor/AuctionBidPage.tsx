import React, { useState, useEffect } from 'react';
import { Clock, Upload, Users, DollarSign, Calendar, ChevronLeft, Info, AlertTriangle } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { getLeilaoById } from '../../services/auctionService';
import { createLance } from '../../services/lanceService';

// Interfaces
interface Leilao {
  id?: number;
  titulo: string;
  descricao: string;
  precoInicial: number;
  precoFinal: number | null;
  dataInicio: string;
  dataTermino: string;
  dataEntrega: string;
  status: number;
  produtoId: number;
  usuarioId?: number;
  dataCriacao?: string;
  dataAtualizacao?: string;
}

interface Lance {
  id?: number;
  valor: number;
  vencedor?: boolean;
  observacao?: string;
  usuarioId: number;
  leilaoId: number;
  dataCriacao?: string;
}

const AuctionBidPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // States
  const [auction, setAuction] = useState<Leilao | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bidValue, setBidValue] = useState('');
  const [deliveryDate, setDeliveryDate] = useState(() => {
    // Default delivery date: 7 days from now
    const date = new Date();
    date.setDate(date.getDate() + 7);
    return date.toISOString().split('T')[0];
  });
  const [description, setDescription] = useState('');
  const [fileNames, setFileNames] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [timeRemaining, setTimeRemaining] = useState('');
  const [activeTab, setActiveTab] = useState('auction');

  // Mock user ID - você deve pegar isso do contexto de autenticação
  const currentUserId = 1; // Substitua pela lógica real de autenticação

  // Fetch auction data
  useEffect(() => {
    const fetchAuctionData = async () => {
      if (!id) {
        setError('ID do leilão não encontrado');
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const leilaoData = await getLeilaoById(parseInt(id));
        console.log('dados recebidos: ', leilaoData )
        setAuction(leilaoData);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching auction:', err);
        setError(err instanceof Error ? err.message : 'Ocorreu um erro ao carregar os dados do leilão');
        setLoading(false);
      }
    };

    fetchAuctionData();
  }, [id]);

  // Update time remaining every second
  useEffect(() => {
    if (!auction) return;
    
    const interval = setInterval(() => {
      const end = new Date(auction.dataTermino);
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
    // Simulate adding files - você pode implementar upload real aqui
    const mockFiles = ['especificacao_tecnica.pdf', 'catalogo_produtos.pdf', 'certificado_garantia.jpg'];
    setFileNames(mockFiles);
  };

  const handleRemoveFile = (index: number) => {
    setFileNames(fileNames.filter((_, i) => i !== index));
  };

 const handleSubmitBid = async (e: React.FormEvent) => {
  e.preventDefault();
  
  if (!auction || !id) return;
  
  // Validação de campos obrigatórios
  if (bidValue === '' || !deliveryDate || !description) {
    setErrorMessage('Por favor, preencha todos os campos obrigatórios.');
    return;
  }
  
  const bidValueNum = parseFloat(bidValue);
  
  // Validação básica do valor
  if (isNaN(bidValueNum)) {
    setErrorMessage('Por favor, insira um valor numérico válido.');
    return;
  }

  // Validação contra valor zero ou negativo
  if (bidValueNum <= 0) {
    setErrorMessage('O valor do lance deve ser maior que zero.');
    return;
  }

  // Validação contra preço máximo (se existir)
  if (auction.precoFinal !== null && bidValueNum > auction.precoFinal) {
    setErrorMessage(`O valor do lance não pode ser maior que o preço máximo (R$ ${auction.precoFinal.toFixed(2)}).`);
    return;
  }

  // Validação contra preço inicial (deve ser menor)
  if (bidValueNum >= auction.precoInicial) {
    setErrorMessage(`O valor do lance deve ser menor que o preço inicial (R$ ${auction.precoInicial.toFixed(2)}).`);
    return;
  }

  // Validação de diferença mínima (opcional)
  const MIN_BID_DIFFERENCE = 0.01;
  if (bidValueNum >= auction.precoInicial - MIN_BID_DIFFERENCE) {
    setErrorMessage(`O lance deve ser pelo menos R$ ${MIN_BID_DIFFERENCE.toFixed(2)} menor que o preço atual.`);
    return;
  }
  
  setIsSubmitting(true);
  setErrorMessage(null);
  
  try {
    const lanceData: Lance = {
      valor: bidValueNum,
      observacao: description,
      usuarioId: currentUserId,
      leilaoId: parseInt(id),
      vencedor: false
    };

    await createLance(lanceData);
    
    setSuccessMessage('Seu lance foi registrado com sucesso!');
    
    // Reset form
    setBidValue('');
    setDescription('');
    setFileNames([]);
    
    // Redirect after successful submission
    setTimeout(() => {
      navigate('/list');
    }, 3000);
    
  } catch (err) {
    console.error('Error submitting bid:', err);
    setErrorMessage(err instanceof Error ? err.message : 'Erro ao enviar lance. Tente novamente.');
  } finally {
    setIsSubmitting(false);
  }
};

  // Mock navigation
  const navigateBack = () => {
    navigate('/list');
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR') + ' ' + date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  // Get status text
  const getStatusText = (status: number) => {
    switch (status) {
      case 0:
        return 'Em andamento';
      case 1:
        return 'Encerrado';
      case 2:
        return 'Cancelado';
      default:
        return 'Desconhecido';
    }
  };

  // Get status color
  const getStatusColor = (status: number) => {
    switch (status) {
      case 0:
        return 'text-green-600';
      case 1:
        return 'text-orange-600';
      case 2:
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  // Check if auction is active
  const isAuctionActive = () => {
    if (!auction) return false;
    return auction.status === 0 && new Date(auction.dataTermino) > new Date();
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
              Voltar para a lista de leilões
            </button>
          </div>
          
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            <div className="flex">
              <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
              <div>
                <p className="font-medium">Erro ao carregar o leilão</p>
                <p>{error || 'O leilão solicitado não foi encontrado.'}</p>
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
            Voltar para a lista de leilões
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
                <p className="text-sm">Você será redirecionado para a lista de leilões em instantes.</p>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Auction Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col md:flex-row md:justify-between md:items-start">
              <div>
                <h1 className="text-2xl font-bold text-gray-800 mb-2">{auction.titulo}</h1>
                <div className="flex items-center text-gray-600 text-sm mb-1">
                  <Users className="h-4 w-4 mr-1" />
                  <span>Leilão ID: {auction.id}</span>
                </div>
                <div className="flex items-center text-gray-600 text-sm">
                  <span className="mr-2">Status:</span>
                  <span className={`font-medium ${getStatusColor(auction.status)}`}>
                    {getStatusText(auction.status)}
                  </span>
                </div>
              </div>
              <div className="text-left md:text-right mt-4 md:mt-0">
                <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium inline-block mb-2">
                  <Clock className="h-4 w-4 inline-block mr-1" />
                  {timeRemaining}
                </div>
                <div className="text-gray-600 text-sm">
                  <p>Iniciado em: {formatDate(auction.dataInicio)}</p>
                  <p>Término em: {formatDate(auction.dataTermino)}</p>
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
                Detalhes do Leilão
              </button>
              <button
                onClick={() => setActiveTab('bid')}
                disabled={!isAuctionActive()}
                className={`py-4 px-6 font-medium text-sm border-b-2 ${
                  activeTab === 'bid'
                    ? 'border-blue-500 text-black'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } ${!isAuctionActive() ? 'opacity-50 cursor-not-allowed' : ''}`}
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
                    
                    <div className="mt-6">
                      <h3 className="text-lg font-semibold mb-2">Detalhes do Leilão</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <p className="text-sm text-gray-500 mb-1">Preço Inicial</p>
                          <p className="text-xl font-bold text-black">R$ {auction.precoInicial.toFixed(2)}</p>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <p className="text-sm text-gray-500 mb-1">Preço Máximo</p>
                          <p className="text-xl font-bold text-black">
                            {auction.precoFinal !== null 
                              ? `R$ ${auction.precoFinal.toFixed(2)}` 
                              : 'Não definido'
                            }
                          </p>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <p className="text-sm text-gray-500 mb-1">Data de Entrega</p>
                          <p className="text-lg font-bold">{formatDate(auction.dataEntrega)}</p>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <p className="text-sm text-gray-500 mb-1">Status</p>
                          <p className={`text-xl font-bold ${getStatusColor(auction.status)}`}>
                            {getStatusText(auction.status)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Descrição</h3>
                    <div className="bg-gray-50 p-4 rounded-lg mb-6">
                      <p className="text-gray-700">{auction.descricao}</p>
                    </div>
                    
                    <h3 className="text-lg font-semibold mb-3">Informações Adicionais</h3>
                    <div className="bg-gray-50 p-4 rounded-lg mb-6">
                      <div className="flex items-start mb-3">
                        <Info className="h-5 w-5 text-blue-500 mr-2 mt-0.5" />
                        <div>
                          <p className="font-medium">Entrega Programada</p>
                          <p className="text-gray-600 text-sm">
                            Data de entrega: {formatDate(auction.dataEntrega)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start mb-3">
                        <Info className="h-5 w-5 text-blue-500 mr-2 mt-0.5" />
                        <div>
                          <p className="font-medium">Produto ID</p>
                          <p className="text-gray-600 text-sm">Produto relacionado: {auction.produtoId}</p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <Info className="h-5 w-5 text-blue-500 mr-2 mt-0.5" />
                        <div>
                          <p className="font-medium">Pagamento</p>
                          <p className="text-gray-600 text-sm">O pagamento será realizado conforme acordado após o leilão.</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-6">
                      <button 
                        onClick={() => setActiveTab('bid')}
                        disabled={!isAuctionActive()}
                        className={`w-full py-3 px-4 font-medium rounded-lg transition duration-150 ${
                          isAuctionActive()
                            ? 'bg-black text-white hover:bg-blue-700'
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }`}
                      >
                        {isAuctionActive() ? 'Participar deste Leilão' : 'Leilão Indisponível'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div>
                {/* Check if auction is active for bidding */}
                {!isAuctionActive() && (
                  <div className="mb-6 bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-lg">
                    <div className="flex">
                      <AlertTriangle className="h-5 w-5 text-yellow-500 mr-2" />
                      <div>
                        <p className="font-medium">Leilão não disponível para lances</p>
                        <p>Este leilão não está ativo ou já foi encerrado.</p>
                      </div>
                    </div>
                  </div>
                )}

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
                            min="0.01"
                            step="0.01"
                            required
                            value={bidValue}
                            onChange={(e) => setBidValue(e.target.value)}
                            disabled={!isAuctionActive()}
                            className="block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                            placeholder="0,00"
                          />
                          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                            <span className="text-gray-500 sm:text-sm">BRL</span>
                          </div>
                        </div>
                        
                        {/* Mensagens de validação */}
                        {bidValue && parseFloat(bidValue) <= 0 && (
                          <p className="mt-1 text-sm text-red-600">
                            O valor do lance deve ser maior que zero.
                          </p>
                        )}
                        
                        {bidValue && auction.precoFinal !== null && parseFloat(bidValue) > auction.precoFinal && (
                          <p className="mt-1 text-sm text-red-600">
                            O valor não pode exceder o preço máximo de R$ {auction.precoFinal.toFixed(2)}
                          </p>
                        )}
                        
                        {bidValue && parseFloat(bidValue) >= auction.precoInicial && (
                          <p className="mt-1 text-sm text-red-600">
                            O valor deve ser menor que o preço inicial de R$ {auction.precoInicial.toFixed(2)}
                          </p>
                        )}
                        
                        {bidValue && parseFloat(bidValue) > 0 && 
                        parseFloat(bidValue) < auction.precoInicial &&
                        auction.precoFinal !== null && 
                        parseFloat(bidValue) <= auction.precoFinal && (
                          <p className="mt-1 text-sm text-green-600">
                            Lance válido! Você está oferecendo R$ {parseFloat(bidValue).toFixed(2)}
                          </p>
                        )}
                        
                        <p className="mt-1 text-sm text-gray-500">
                          Valor inicial: R$ {auction.precoInicial.toFixed(2)}
                          {auction.precoFinal !== null && (
                            <> • Valor máximo permitido: R$ {auction.precoFinal.toFixed(2)}</>
                          )}
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
                            disabled={!isAuctionActive()}
                            className="block w-full pl-10 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
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
                              <button
                                type="button"
                                onClick={handleFileSelection}
                                disabled={!isAuctionActive()}
                                className="relative cursor-pointer bg-white rounded-md font-medium text-black hover:text-blue-500 disabled:cursor-not-allowed disabled:text-gray-400"
                              >
                                Escolher arquivos
                              </button>
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
                                    disabled={!isAuctionActive()}
                                    className="ml-2 text-red-500 hover:text-red-700 disabled:cursor-not-allowed disabled:text-gray-400"
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
                          disabled={!isAuctionActive()}
                          className="block w-full py-3 px-4 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
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
                              <p>Ao submeter seu lance, você concorda com os termos e condições do leilão e confirma que poderá entregar os itens conforme as especificações e no prazo indicado.</p>
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
                          disabled={isSubmitting || !isAuctionActive()}
                          className="px-4 py-2 bg-black text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
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