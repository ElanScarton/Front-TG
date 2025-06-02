import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Search, Clock, AlertCircle, TrendingDown, TrendingUp, Trophy, Eye } from 'lucide-react';
import { getLances } from '../../services/lanceService';
import { getLeilaoById } from '../../services/auctionService';

// Interface para os dados do lance
interface Lance {
  id?: number;
  valor: number;
  vencedor?: boolean;
  observacao?: string;
  usuarioId: number;
  leilaoId: number;
  dataCriacao?: string;
}

// Interface para os dados do leilão
interface Leilao {
  id?: number;
  titulo: string;
  descricao: string;
  precoInicial: number;
  precoFinal?: number;
  dataInicio: string;
  dataTermino: string;
  dataEntrega: string;
  status: number;
  produtoId: number;
  usuarioId?: number;
}

// Interface combinada para exibição
interface BidWithAuction {
  id: number;
  valor: number;
  vencedor: boolean;
  observacao: string;
  dataCriacao: string;
  leilao: {
    id: number;
    titulo: string;
    descricao: string;
    precoInicial: number;
    precoFinal: number;
    dataInicio: string;
    dataTermino: string;
    status: number;
  };
  status: 'active' | 'won' | 'lost' | 'ended';
}

const MyBidsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [bids, setBids] = useState<BidWithAuction[]>([]);
  const [filteredBids, setFilteredBids] = useState<BidWithAuction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Função para determinar o status do lance
  const getBidStatus = (lance: Lance, leilao: Leilao): 'active' | 'won' | 'lost' | 'ended' => {
    const now = new Date();
    const endDate = new Date(leilao.dataTermino);
    
    // Se o leilão ainda está ativo
    if (endDate > now && leilao.status === 0) {
      return 'active';
    }
    
    // Se o leilão terminou
    if (endDate <= now || leilao.status !== 0) {
      if (lance.vencedor) {
        return 'won';
      } else {
        return 'lost';
      }
    }
    
    return 'ended';
  };

  // Buscar lances do fornecedor
  useEffect(() => {
    const fetchMyBids = async () => {
      if (!user?.id) return;
      
      setIsLoading(true);
      setError(null);

      try {
        // Buscar todos os lances
        const allLances = await getLances();
        console.log(allLances)
        // Filtrar apenas os lances do usuário atual
        const myLances = allLances.filter(lance => lance.usuarioId == user.id);
        console.log(myLances)
        // Buscar dados dos leilões para cada lance
        const bidsWithAuctions: BidWithAuction[] = [];
        
        for (const lance of myLances) {
          try {
            const leilao = await getLeilaoById(lance.leilaoId);
            const status = getBidStatus(lance, leilao);
            
            bidsWithAuctions.push({
              id: lance.id!,
              valor: lance.valor,
              vencedor: lance.vencedor || false,
              observacao: lance.observacao || '',
              dataCriacao: lance.dataCriacao || '',
              leilao: {
                id: leilao.id!,
                titulo: leilao.titulo,
                descricao: leilao.descricao,
                precoInicial: leilao.precoInicial,
                precoFinal: leilao.precoFinal,
                dataInicio: leilao.dataInicio,
                dataTermino: leilao.dataTermino,
                status: leilao.status
              },
              status
            });
          } catch (leilaoError) {
            console.error(`Erro ao buscar leilão ${lance.leilaoId}:`, leilaoError);
          }
        }
        
        // Ordenar por data de criação (mais recente primeiro)
        bidsWithAuctions.sort((a, b) => 
          new Date(b.dataCriacao).getTime() - new Date(a.dataCriacao).getTime()
        );
        
        setBids(bidsWithAuctions);
        setFilteredBids(bidsWithAuctions);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro desconhecido ao carregar os lances');
        console.error('Error fetching my bids:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMyBids();
  }, [user?.id]);

  // Filtrar lances baseado na pesquisa e filtro
  useEffect(() => {
    let result = bids;

    // Aplicar filtro de pesquisa
    if (searchQuery) {
      result = result.filter(bid => 
        bid.leilao.titulo.toLowerCase().includes(searchQuery.toLowerCase()) ||
        bid.leilao.descricao.toLowerCase().includes(searchQuery.toLowerCase()) ||
        bid.observacao.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Aplicar filtro de status
    if (filter !== 'all') {
      result = result.filter(bid => bid.status === filter);
    }

    setFilteredBids(result);
    setCurrentPage(1);
  }, [searchQuery, filter, bids]);

  const displayedBids = filteredBids.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredBids.length / itemsPerPage);

  const handlePageChange = (page: number) => {
    if (page > 0 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const getPaginationButtons = () => {
    const buttons: number[] = [];
    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, currentPage + 2);

    if (currentPage - 2 < 1) {
      endPage = Math.min(totalPages, endPage + (3 - (currentPage - startPage)));
    }

    if (currentPage + 2 > totalPages) {
      startPage = Math.max(1, startPage - (currentPage + 2 - totalPages));
    }

    for (let page = startPage; page <= endPage; page++) {
      buttons.push(page);
    }

    return buttons;
  };

  // Formatear data para exibição
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR') + ' ' + date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  // Calcular tempo restante
  const getTimeRemaining = (endTime: string) => {
    const end = new Date(endTime);
    const now = new Date();
    const diffMs = end.getTime() - now.getTime();
    
    if (diffMs < 0) return 'Encerrado';
    
    const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (diffHrs > 0) {
      return `${diffHrs}h ${diffMins}m restantes`;
    } else {
      return `${diffMins}m restantes`;
    }
  };

  // Obter cor do badge de status
  const getStatusBadgeColor = (status: 'active' | 'won' | 'lost' | 'ended') => {
    switch (status) {
      case 'active':
        return 'bg-blue-100 text-blue-800';
      case 'won':
        return 'bg-green-100 text-green-800';
      case 'lost':
        return 'bg-red-100 text-red-800';
      case 'ended':
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Obter texto do status
  const getStatusText = (status: 'active' | 'won' | 'lost' | 'ended') => {
    switch (status) {
      case 'active':
        return 'Em andamento';
      case 'won':
        return 'Vencedor';
      case 'lost':
        return 'Perdido';
      case 'ended':
        return 'Finalizado';
    }
  };

  // Obter ícone do status
  const getStatusIcon = (status: 'active' | 'won' | 'lost' | 'ended') => {
    switch (status) {
      case 'active':
        return <Clock className="h-4 w-4" />;
      case 'won':
        return <Trophy className="h-4 w-4" />;
      case 'lost':
        return <TrendingDown className="h-4 w-4" />;
      case 'ended':
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  // Estatísticas dos lances
  const totalBids = bids.length;
  const wonBids = bids.filter(bid => bid.status === 'won').length;
  const activeBids = bids.filter(bid => bid.status === 'active').length;
  const winRate = totalBids > 0 ? ((wonBids / totalBids) * 100).toFixed(1) : '0';

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full p-6">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full p-6">
        <div className="bg-red-50 p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-red-700 mb-2">Erro ao carregar os lances</h2>
          <p className="text-red-600">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-6 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Meus Lances</h1>
          <p className="text-gray-600">Acompanhe todos os seus lances em pregões</p>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-blue-500" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Total de Lances</p>
                <p className="text-2xl font-bold text-gray-900">{totalBids}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-orange-500" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Em Andamento</p>
                <p className="text-2xl font-bold text-gray-900">{activeBids}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="flex items-center">
              <Trophy className="h-8 w-8 text-green-500" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Vencidos</p>
                <p className="text-2xl font-bold text-gray-900">{wonBids}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-purple-500" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Taxa de Vitória</p>
                <p className="text-2xl font-bold text-gray-900">{winRate}%</p>
              </div>
            </div>
          </div>
        </div>

        {/* Barra de pesquisa e filtros */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
          <div className="relative w-full md:w-1/2">
            <input
              type="text"
              placeholder="Buscar por pregão ou observação..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>

          <div className="flex space-x-4 w-full md:w-auto">
            <div className="relative">
              <button 
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="px-4 py-2 bg-white border border-gray-300 rounded-lg flex items-center space-x-2 hover:bg-gray-50"
              >
                <AlertCircle className="h-5 w-5 text-gray-500" />
                <span>
                  {filter === 'all' ? 'Todos os status' : 
                   filter === 'active' ? 'Em andamento' : 
                   filter === 'won' ? 'Vencedores' : 
                   filter === 'lost' ? 'Perdidos' : 'Finalizados'}
                </span>
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-10">
                  <button 
                    onClick={() => {setFilter('all'); setDropdownOpen(false);}}
                    className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                  >
                    Todos os status
                  </button>
                  <button 
                    onClick={() => {setFilter('active'); setDropdownOpen(false);}}
                    className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                  >
                    Em andamento
                  </button>
                  <button 
                    onClick={() => {setFilter('won'); setDropdownOpen(false);}}
                    className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                  >
                    Vencedores
                  </button>
                  <button 
                    onClick={() => {setFilter('lost'); setDropdownOpen(false);}}
                    className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                  >
                    Perdidos
                  </button>
                  <button 
                    onClick={() => {setFilter('ended'); setDropdownOpen(false);}}
                    className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                  >
                    Finalizados
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Grid de lances */}
        {displayedBids.length === 0 ? (
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <AlertCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-1">Nenhum lance encontrado</h3>
            <p className="text-gray-500">
              {totalBids === 0 
                ? 'Você ainda não participou de nenhum pregão' 
                : 'Tente ajustar seus filtros de pesquisa'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {displayedBids.map((bid) => (
              <div 
                key={bid.id} 
                className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 p-6"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {bid.leilao.titulo}
                    </h3>
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {bid.leilao.descricao}
                    </p>
                  </div>
                  <div className="ml-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeColor(bid.status)}`}>
                      {getStatusIcon(bid.status)}
                      <span className="ml-1">{getStatusText(bid.status)}</span>
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Meu Lance:</span>
                    <span className="text-lg font-bold text-blue-600">
                      R$ {bid.valor.toFixed(2)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Preço Inicial:</span>
                    <span className="text-sm font-medium text-gray-900">
                      R$ {bid.leilao.precoInicial.toFixed(2)}
                    </span>
                  </div>

                  {bid.leilao.precoFinal && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">Preço Final:</span>
                      <span className="text-sm font-medium text-gray-900">
                        R$ {bid.leilao.precoFinal.toFixed(2)}
                      </span>
                    </div>
                  )}

                  <div className="border-t pt-3">
                    <div className="flex items-center text-sm text-gray-600 mb-2">
                      <Clock className="h-4 w-4 mr-1" />
                      <span>
                        {bid.status === 'active' 
                          ? getTimeRemaining(bid.leilao.dataTermino)
                          : `Finalizado em: ${formatDate(bid.leilao.dataTermino)}`}
                      </span>
                    </div>
                    
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">Lance feito em:</span> {formatDate(bid.dataCriacao)}
                    </div>
                  </div>

                  {bid.observacao && (
                    <div className="border-t pt-3">
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Observação:</span> {bid.observacao}
                      </p>
                    </div>
                  )}

                  <div className="border-t pt-3 flex space-x-2">
                    <button 
                      onClick={() => navigate(`/auctions/${bid.leilao.id}/bid`)}
                      className="flex-1 flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Ver Pregão
                    </button>
                    
                    {bid.status === 'active' && (
                      <button 
                        onClick={() => navigate(`/auctions/${bid.leilao.id}/bid`)}
                        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
                      >
                        Renovar proposta
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Paginação */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-8">
            <div className="flex items-center space-x-1">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-1 rounded-md border border-gray-300 bg-white text-gray-700 disabled:opacity-50"
              >
                Anterior
              </button>
              
              {getPaginationButtons().map(page => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`px-3 py-1 rounded-md ${
                    page === currentPage 
                      ? 'bg-blue-600 text-white' 
                      : 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {page}
                </button>
              ))}
              
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-1 rounded-md border border-gray-300 bg-white text-gray-700 disabled:opacity-50"
              >
                Próximo
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyBidsPage;