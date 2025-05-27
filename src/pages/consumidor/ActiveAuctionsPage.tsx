// Navigate to auction monitor
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface Usuario {
  id: number;
  nome: string;
  email: string;
}

interface Produto {
  id: number;
  titulo: string;
  descricao: string;
  preco: number;
  thumbnail: string;
}

interface Lance {
  id: number;
  valor: number;
  vencedor: boolean;
  observacao?: string;
  usuarioId: number;
  leilaoId: number;
  dataCriacao: string;
  usuario: Usuario;
}

interface Leilao {
  id: number;
  titulo: string;
  descricao: string;
  precoInicial: number;
  precoFinal?: number;
  dataInicio: string;
  dataTermino: string;
  dataEntrega: string;
  status: 'Rascunho' | 'Publicado' | 'EmAndamento' | 'Finalizado' | 'Cancelado';
  produtoId: number;
  usuarioId: number;
  dataCriacao: string;
  dataAtualizacao: string;
  lances: Lance[];
  produto: Produto;
  usuario: Usuario;
}

const ActiveAuctions: React.FC = () => {

  const navigate = useNavigate();
  // State management
  const [leiloes, setLeiloes] = useState<Leilao[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('EmAndamento');
  const [searchTerm, setSearchTerm] = useState('');

  // Mock data - Replace with actual API calls
  const mockLeiloes: Leilao[] = [
    {
      id: 1,
      titulo: 'iPhone 15 Pro Max',
      descricao: 'Smartphone Apple iPhone 15 Pro Max 256GB',
      precoInicial: 8999.00,
      precoFinal: null,
      dataInicio: '2024-01-15T09:00:00',
      dataTermino: '2024-01-15T17:00:00',
      dataEntrega: '2024-01-20T09:00:00',
      status: 'EmAndamento',
      produtoId: 1,
      usuarioId: 1,
      dataCriacao: '2024-01-14T15:30:00',
      dataAtualizacao: '2024-01-15T16:45:00',
      produto: {
        id: 1,
        titulo: 'iPhone 15 Pro Max',
        descricao: 'Smartphone Apple iPhone 15 Pro Max 256GB',
        preco: 8999.00,
        thumbnail: 'https://cdn.dummyjson.com/product-images/1/thumbnail.jpg'
      },
      usuario: {
        id: 1,
        nome: 'João Silva',
        email: 'joao@empresa.com'
      },
      lances: [
        {
          id: 1,
          valor: 8500.00,
          vencedor: false,
          observacao: 'Primeira oferta',
          usuarioId: 2,
          leilaoId: 1,
          dataCriacao: '2024-01-15T10:15:00',
          usuario: { id: 2, nome: 'TechSupply Inc.', email: 'contato@techsupply.com' }
        },
        {
          id: 2,
          valor: 8200.00,
          vencedor: false,
          observacao: 'Melhor oferta disponível',
          usuarioId: 3,
          leilaoId: 1,
          dataCriacao: '2024-01-15T11:30:00',
          usuario: { id: 3, nome: 'Global Electronics', email: 'vendas@global.com' }
        }
      ]
    },
    {
      id: 2,
      titulo: 'MacBook Pro M3',
      descricao: 'MacBook Pro 14" com chip M3, 16GB RAM, 512GB SSD',
      precoInicial: 15999.00,
      precoFinal: null,
      dataInicio: '2024-01-15T08:00:00',
      dataTermino: '2024-01-15T18:00:00',
      dataEntrega: '2024-01-22T09:00:00',
      status: 'EmAndamento',
      produtoId: 2,
      usuarioId: 1,
      dataCriacao: '2024-01-14T10:00:00',
      dataAtualizacao: '2024-01-15T16:00:00',
      produto: {
        id: 2,
        titulo: 'MacBook Pro M3',
        descricao: 'MacBook Pro 14" com chip M3, 16GB RAM, 512GB SSD',
        preco: 15999.00,
        thumbnail: 'https://cdn.dummyjson.com/product-images/6/thumbnail.png'
      },
      usuario: {
        id: 1,
        nome: 'João Silva',
        email: 'joao@empresa.com'
      },
      lances: [
        {
          id: 3,
          valor: 15200.00,
          vencedor: false,
          observacao: 'Oferta inicial',
          usuarioId: 4,
          leilaoId: 2,
          dataCriacao: '2024-01-15T09:15:00',
          usuario: { id: 4, nome: 'Digital Solutions', email: 'propostas@digital.com' }
        }
      ]
    },
    {
      id: 3,
      titulo: 'Samsung Galaxy S24 Ultra',
      descricao: 'Smartphone Samsung Galaxy S24 Ultra 512GB',
      precoInicial: 7499.00,
      precoFinal: null,
      dataInicio: '2024-01-15T10:00:00',
      dataTermino: '2024-01-15T16:00:00',
      dataEntrega: '2024-01-18T14:00:00',
      status: 'EmAndamento',
      produtoId: 3,
      usuarioId: 2,
      dataCriacao: '2024-01-14T14:00:00',
      dataAtualizacao: '2024-01-15T15:30:00',
      produto: {
        id: 3,
        titulo: 'Samsung Galaxy S24 Ultra',
        descricao: 'Smartphone Samsung Galaxy S24 Ultra 512GB',
        preco: 7499.00,
        thumbnail: 'https://cdn.dummyjson.com/product-images/2/thumbnail.jpg'
      },
      usuario: {
        id: 2,
        nome: 'Maria Santos',
        email: 'maria@empresa.com'
      },
      lances: [
        {
          id: 4,
          valor: 7100.00,
          vencedor: false,
          observacao: 'Proposta competitiva',
          usuarioId: 5,
          leilaoId: 3,
          dataCriacao: '2024-01-15T12:00:00',
          usuario: { id: 5, nome: 'Office Depot', email: 'licitacoes@office.com' }
        },
        {
          id: 5,
          valor: 6950.00,
          vencedor: false,
          observacao: 'Melhor preço',
          usuarioId: 3,
          leilaoId: 3,
          dataCriacao: '2024-01-15T14:30:00',
          usuario: { id: 3, nome: 'Global Electronics', email: 'vendas@global.com' }
        }
      ]
    },
    {
      id: 4,
      titulo: 'Dell XPS 13',
      descricao: 'Notebook Dell XPS 13, Intel i7, 16GB RAM, 1TB SSD',
      precoInicial: 8500.00,
      precoFinal: 7800.00,
      dataInicio: '2024-01-14T09:00:00',
      dataTermino: '2024-01-14T17:00:00',
      dataEntrega: '2024-01-19T10:00:00',
      status: 'Finalizado',
      produtoId: 4,
      usuarioId: 1,
      dataCriacao: '2024-01-13T16:00:00',
      dataAtualizacao: '2024-01-14T17:05:00',
      produto: {
        id: 4,
        titulo: 'Dell XPS 13',
        descricao: 'Notebook Dell XPS 13, Intel i7, 16GB RAM, 1TB SSD',
        preco: 8500.00,
        thumbnail: 'https://cdn.dummyjson.com/product-images/7/thumbnail.jpg'
      },
      usuario: {
        id: 1,
        nome: 'João Silva',
        email: 'joao@empresa.com'
      },
      lances: [
        {
          id: 6,
          valor: 7800.00,
          vencedor: true,
          observacao: 'Lance vencedor',
          usuarioId: 2,
          leilaoId: 4,
          dataCriacao: '2024-01-14T16:45:00',
          usuario: { id: 2, nome: 'TechSupply Inc.', email: 'contato@techsupply.com' }
        }
      ]
    }
  ];

  // Fetch auctions data
  useEffect(() => {
    const fetchLeiloes = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Replace with actual API call
        // const response = await fetch('/api/leiloes');
        // const data = await response.json();
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        setLeiloes(mockLeiloes);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao carregar leilões');
      } finally {
        setIsLoading(false);
      }
    };

    fetchLeiloes();
  }, []);

  // Get auction status info
  const getStatusInfo = (status: string) => {
    const statusMap = {
      'Rascunho': { color: 'bg-gray-100 text-gray-800', label: 'Rascunho' },
      'Publicado': { color: 'bg-blue-100 text-blue-800', label: 'Publicado' },
      'EmAndamento': { color: 'bg-green-100 text-green-800', label: 'Em Andamento' },
      'Finalizado': { color: 'bg-purple-100 text-purple-800', label: 'Finalizado' },
      'Cancelado': { color: 'bg-red-100 text-red-800', label: 'Cancelado' }
    };
    return statusMap[status as keyof typeof statusMap] || statusMap['Rascunho'];
  };

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  // Format date
  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR');
  };

  // Calculate time remaining
  const getTimeRemaining = (endDate: string) => {
    const now = new Date().getTime();
    const end = new Date(endDate).getTime();
    const diff = end - now;

    if (diff <= 0) return 'Encerrado';

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    return `${hours}h ${minutes}m restantes`;
  };

  // Get best bid for auction
  const getBestBid = (lances: Lance[]) => {
    if (lances.length === 0) return null;
    return Math.min(...lances.map(lance => lance.valor));
  };

  // Filter auctions
  const filteredLeiloes = leiloes.filter(leilao => {
    const matchesFilter = filter === 'Todos' || leilao.status === filter;
    const matchesSearch = leilao.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         leilao.produto.titulo.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  // Navigate to auction monitor
  const handleViewAuction = (leilaoId: number) => {
    navigate(`/AuctionMonitorPage/${leilaoId}`);
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
          <h2 className="text-xl font-semibold text-red-700 mb-2">Erro ao carregar pregões</h2>
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-6 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard de Pregões</h1>
          <p className="text-gray-600">Acompanhe todos os pregões eletrônicos em tempo real</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100 text-green-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Em Andamento</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {leiloes.filter(l => l.status === 'EmAndamento').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Publicados</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {leiloes.filter(l => l.status === 'Publicado').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-100 text-purple-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Finalizados</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {leiloes.filter(l => l.status === 'Finalizado').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-yellow-100 text-yellow-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total de Lances</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {leiloes.reduce((total, leilao) => total + leilao.lances.length, 0)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
            <div className="flex space-x-2">
              {['Todos', 'EmAndamento', 'Publicado', 'Finalizado'].map((status) => (
                <button
                  key={status}
                  onClick={() => setFilter(status)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    filter === status
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {status === 'Todos' ? 'Todos' : 
                   status === 'EmAndamento' ? 'Em Andamento' : 
                   status === 'Publicado' ? 'Publicados' : 'Finalizados'}
                </button>
              ))}
            </div>

            <div className="relative">
              <input
                type="text"
                placeholder="Buscar pregões..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <svg
                className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Auctions Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredLeiloes.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <div className="text-gray-400 mb-4">
                <svg className="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum pregão encontrado</h3>
              <p className="text-gray-500">Ajuste os filtros ou tente uma busca diferente.</p>
            </div>
          ) : (
            filteredLeiloes.map((leilao) => {
              const statusInfo = getStatusInfo(leilao.status);
              const bestBid = getBestBid(leilao.lances);
              const timeRemaining = getTimeRemaining(leilao.dataTermino);

              return (
                <div key={leilao.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
                  <div className="p-6">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                          {leilao.titulo}
                        </h3>
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {leilao.descricao}
                        </p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ml-2 ${statusInfo.color}`}>
                        {statusInfo.label}
                      </span>
                    </div>

                    {/* Product Image */}
                    <div className="mb-4">
                      <img
                        src={leilao.produto.thumbnail}
                        alt={leilao.produto.titulo}
                        className="w-full h-32 object-cover rounded-md"
                      />
                    </div>

                    {/* Price Info */}
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Preço Inicial:</span>
                        <span className="font-medium">{formatCurrency(leilao.precoInicial)}</span>
                      </div>
                      
                      {bestBid && (
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Melhor Lance:</span>
                          <span className="font-medium text-green-600">{formatCurrency(bestBid)}</span>
                        </div>
                      )}

                      {leilao.precoFinal && (
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Preço Final:</span>
                          <span className="font-medium text-purple-600">{formatCurrency(leilao.precoFinal)}</span>
                        </div>
                      )}
                    </div>

                    {/* Stats */}
                    <div className="flex justify-between items-center mb-4 text-sm">
                      <div className="text-center">
                        <div className="font-medium text-gray-900">{leilao.lances.length}</div>
                        <div className="text-gray-600">Lances</div>
                      </div>
                      
                      <div className="text-center">
                        <div className="font-medium text-gray-900">
                          {bestBid ? formatCurrency(leilao.precoInicial - bestBid) : '-'}
                        </div>
                        <div className="text-gray-600">Economia</div>
                      </div>
                    </div>

                    {/* Time Info */}
                    <div className="mb-4">
                      {leilao.status === 'EmAndamento' && (
                        <div className="text-center">
                          <div className="text-sm font-medium text-orange-600">{timeRemaining}</div>
                          <div className="text-xs text-gray-500">
                            Término: {formatDateTime(leilao.dataTermino)}
                          </div>
                        </div>
                      )}
                      
                      {leilao.status === 'Finalizado' && (
                        <div className="text-center">
                          <div className="text-sm font-medium text-purple-600">Finalizado</div>
                          <div className="text-xs text-gray-500">
                            Em: {formatDateTime(leilao.dataTermino)}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Action Button */}
                    <button
                      onClick={() => handleViewAuction(leilao.id)}
                      className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
                    >
                      {leilao.status === 'EmAndamento' ? 'Monitorar Pregão' : 'Ver Detalhes'}
                    </button>
                  </div>

                  {/* Live indicator for active auctions */}
                  {leilao.status === 'EmAndamento' && (
                    <div className="px-6 pb-4">
                      <div className="flex items-center justify-center text-green-600">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-2"></div>
                        <span className="text-xs font-medium">AO VIVO</span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default ActiveAuctions;