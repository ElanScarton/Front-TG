import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Tally3, Search, Clock, AlertCircle } from 'lucide-react';
import axios from 'axios';

interface Auction {
  id: string;
  title: string;
  description: string;
  maxBudget: number;
  quantity: number;
  startDateTime: string;
  duration: number;
  thumbnail: string;
  status: 'upcoming' | 'active' | 'ending';
  endTime: string;
  bidsCount: number;
  createdBy: {
    name: string;
    rating: number;
  };
}

const AuctionListPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [filteredAuctions, setFilteredAuctions] = useState<Auction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Mock data fetch - in a real app, this would be a call to your API
  useEffect(() => {
    const fetchAuctions = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // In a real app, this would be a call to your API
        // For now, let's simulate fetching data from dummyjson products and converting them to auctions
        const response = await axios.get('https://dummyjson.com/products?limit=30');
        
        // Transform product data into auction format
        const mockAuctions: Auction[] = response.data.products.map((product: any, index: number) => {
          // Generate random times and statuses
          const now = new Date();
          let startDateTime = new Date();
          let endTime = new Date();
          let status: 'upcoming' | 'active' | 'ending' = 'active';
          
          // Distribute auctions between upcoming, active, and ending
          if (index % 3 === 0) {
            // Upcoming auction
            startDateTime = new Date(now.getTime() + 1000 * 60 * 60 * 24); // Tomorrow
            endTime = new Date(startDateTime.getTime() + 1000 * 60 * 60 * 3); // 3 hours after start
            status = 'upcoming';
          } else if (index % 3 === 1) {
            // Active auction
            startDateTime = new Date(now.getTime() - 1000 * 60 * 60); // Started 1 hour ago
            endTime = new Date(now.getTime() + 1000 * 60 * 60 * 5); // Ends in 5 hours
            status = 'active';
          } else {
            // Ending soon
            startDateTime = new Date(now.getTime() - 1000 * 60 * 60 * 5); // Started 5 hours ago
            endTime = new Date(now.getTime() + 1000 * 60 * 30); // Ends in 30 minutes
            status = 'ending';
          }

          return {
            id: product.id.toString(),
            title: product.title,
            description: product.description,
            maxBudget: product.price * 1.2, // Set max budget slightly higher than product price
            quantity: Math.floor(Math.random() * 10) + 1, // Random quantity 1-10
            startDateTime: startDateTime.toISOString(),
            duration: Math.floor(Math.random() * 180) + 60, // Random duration 60-240 minutes
            thumbnail: product.thumbnail,
            status: status,
            endTime: endTime.toISOString(),
            bidsCount: Math.floor(Math.random() * 15), // Random number of bids
            createdBy: {
              name: `Cliente ${index + 1}`,
              rating: (3 + Math.random() * 2).toFixed(1) // Rating between 3 and 5
            }
          };
        });

        setAuctions(mockAuctions);
        setFilteredAuctions(mockAuctions);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
        console.error('Error fetching auctions:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAuctions();
  }, []);

  // Filter auctions based on search query and filter setting
  useEffect(() => {
    let result = auctions;

    // Apply search filter
    if (searchQuery) {
      result = result.filter(auction => 
        auction.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        auction.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply status filter
    if (filter !== 'all') {
      result = result.filter(auction => auction.status === filter);
    }

    setFilteredAuctions(result);
    setCurrentPage(1); // Reset to first page when filters change
  }, [searchQuery, filter, auctions]);

  const displayedAuctions = filteredAuctions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredAuctions.length / itemsPerPage);

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

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR') + ' ' + date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  // Calculate time remaining
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

  // Get status badge color
  const getStatusBadgeColor = (status: 'upcoming' | 'active' | 'ending') => {
    switch (status) {
      case 'upcoming':
        return 'bg-blue-100 text-blue-800';
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'ending':
        return 'bg-orange-100 text-orange-800';
    }
  };

  // Get status text
  const getStatusText = (status: 'upcoming' | 'active' | 'ending') => {
    switch (status) {
      case 'upcoming':
        return 'Em breve';
      case 'active':
        return 'Ativo';
      case 'ending':
        return 'Terminando';
    }
  };

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
          <h2 className="text-xl font-semibold text-red-700 mb-2">Erro ao carregar os pregões</h2>
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
          <h1 className="text-2xl font-bold text-gray-800">Pregões Disponíveis</h1>
          <p className="text-gray-600">Participe dos pregões abertos e ofereça seus melhores preços</p>
        </div>

        {/* Search and filter bar */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
          <div className="relative w-full md:w-1/2">
            <input
              type="text"
              placeholder="Buscar pregões..."
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
                <Tally3 className="h-5 w-5 text-gray-500" />
                <span>
                  {filter === 'all' ? 'Todos os status' : 
                   filter === 'upcoming' ? 'Em breve' : 
                   filter === 'active' ? 'Ativos' : 'Terminando'}
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
                    Ativos
                  </button>
                  <button 
                    onClick={() => {setFilter('upcoming'); setDropdownOpen(false);}}
                    className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                  >
                    Em breve
                  </button>
                  <button 
                    onClick={() => {setFilter('ending'); setDropdownOpen(false);}}
                    className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                  >
                    Terminando
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Auctions grid */}
        {displayedAuctions.length === 0 ? (
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <AlertCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-1">Nenhum pregão encontrado</h3>
            <p className="text-gray-500">Tente ajustar seus filtros de pesquisa</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {displayedAuctions.map((auction) => (
              <div 
                key={auction.id} 
                className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300"
              >
                <div className="relative h-48">
                  <img 
                    src={auction.thumbnail} 
                    alt={auction.title} 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 right-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeColor(auction.status)}`}>
                      {getStatusText(auction.status)}
                    </span>
                  </div>
                </div>
                
                <div className="p-4">
                  <h3 className="text-lg font-semibold mb-2 line-clamp-2 h-14">{auction.title}</h3>
                  
                  <div className="flex justify-between items-center text-sm text-gray-500 mb-3">
                    <div className="flex items-center">
                      <span className="font-medium mr-1">Qtd:</span> {auction.quantity}
                    </div>
                    <div className="flex items-center">
                      <span className="font-medium mr-1">Lances:</span> {auction.bidsCount}
                    </div>
                  </div>
                  
                  <div className="mb-3">
                    <div className="flex items-center text-sm text-gray-600 mb-1">
                      <Clock className="h-4 w-4 mr-1" />
                      <p>
                        {auction.status === 'upcoming' 
                          ? `Inicia em: ${formatDate(auction.startDateTime)}` 
                          : getTimeRemaining(auction.endTime)}
                      </p>
                    </div>
                    
                    <div className="text-sm text-gray-600">
                      <p className="mb-1">
                        <span className="font-medium">Cliente:</span> {auction.createdBy.name}
                      </p>
                      <div className="flex items-center">
                        <span className="font-medium mr-1">Avaliação:</span>
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
                  </div>
                  
                  <div className="mt-3 flex flex-col space-y-3">
                    <p className="text-lg font-bold text-blue-600">
                      Orçamento máx: R$ {auction.maxBudget.toFixed(2)}
                    </p>
                    
                    <button 
                      onClick={() => navigate(`/auctions/${auction.id}/bid`)}
                      disabled={auction.status === 'upcoming'}
                      className={`w-full py-2 px-4 rounded-md text-center text-white font-medium
                        ${auction.status === 'upcoming' 
                          ? 'bg-gray-300 cursor-not-allowed' 
                          : 'bg-blue-600 hover:bg-blue-700'}`}
                    >
                      {auction.status === 'upcoming' 
                        ? 'Aguarde o início' 
                        : 'Participar do Pregão'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
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

export default AuctionListPage;