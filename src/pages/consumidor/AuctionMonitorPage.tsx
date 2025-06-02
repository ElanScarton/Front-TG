import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { getLeilaoById } from '../../services/auctionService';
import { getLances, updateVencedor } from '../../services/lanceService';
import { getUsuarios } from '../../services/usuarioService';

interface Usuario {
  id: number;
  nome: string;
  email: string;
  tipoUsuario?: string;
  cpf?: string;
  cnpj?: string;
  ativo?: boolean;
  dataCriacao?: string;
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
  status: 'Ativo' | 'Encerrado' | 'Cancelado';
  produtoId: number;
  usuarioId: number;
  dataCriacao: string;
  dataAtualizacao: string;
  lances: Lance[];
  produto: Produto;
  usuario: Usuario;
}

const AuctionMonitorPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [leilao, setLeilao] = useState<Leilao | null>(null);
  const [lances, setLances] = useState<Lance[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshInterval, setRefreshInterval] = useState<NodeJS.Timeout | null>(null);
  const [showWinnerModal, setShowWinnerModal] = useState(false);
  const [selectedWinner, setSelectedWinner] = useState<Lance | null>(null);

  const fetchUsuarios = async () => {
    try {
      const usuariosData = await getUsuarios();
      setUsuarios(usuariosData);
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
    }
  };

  const fetchData = async () => {
    if (!id) {
      setError('ID do leilão não fornecido');
      setIsLoading(false);
      return;
    }

    try {
      setError(null);
      const leilaoData = await getLeilaoById(Number(id));
      const statusMap: { [key: number]: 'Ativo' | 'Encerrado' | 'Cancelado' } = {
        0: 'Ativo',
        1: 'Encerrado',
        2: 'Cancelado'
      };
      
      const mappedLeilao: Leilao = {
        ...leilaoData,
        status: statusMap[leilaoData.status] || 'Ativo',
        lances: [],
        produto: leilaoData.produto || { id: 0, titulo: '', descricao: '', preco: 0, thumbnail: '' },
        usuario: leilaoData.usuario || { id: 0, nome: '', email: '' }
      };
      
      setLeilao(mappedLeilao);

      const todosLances = await getLances();
      const lancesDoLeilao = todosLances
        .filter((lance: any) => lance.leilaoId === Number(id))
        .map((lance: any) => {
          const usuarioEncontrado = usuarios.find(u => u.id === lance.usuarioId);
          return {
            id: lance.id,
            valor: lance.valor,
            vencedor: lance.vencedor || false,
            observacao: lance.observacao,
            usuarioId: lance.usuarioId,
            leilaoId: lance.leilaoId,
            dataCriacao: lance.dataCriacao,
            usuario: usuarioEncontrado || lance.usuario || { 
              id: lance.usuarioId, 
              nome: 'Nome não disponível', 
              email: 'Email não disponível' 
            }
          };
        });
      
      setLances(lancesDoLeilao);
    } catch (err) {
      console.error('Erro ao carregar dados:', err);
      setError(err instanceof Error ? err.message : 'Erro ao carregar dados do leilão');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const initializeData = async () => {
      await fetchUsuarios();
      await fetchData();
    };
    initializeData();
  }, [id]);

  useEffect(() => {
    if (leilao?.status === 'Ativo') {
      if (refreshInterval) {
        clearInterval(refreshInterval);
      }
      
      const interval = setInterval(() => {
        console.log('Atualizando dados do leilão...');
        fetchData();
      }, 30000);

      setRefreshInterval(interval);
      
      return () => {
        if (interval) {
          clearInterval(interval);
        }
      };
    } else {
      if (refreshInterval) {
        clearInterval(refreshInterval);
        setRefreshInterval(null);
      }
    }
  }, [leilao?.status]);

  useEffect(() => {
    return () => {
      if (refreshInterval) {
        clearInterval(refreshInterval);
      }
    };
  }, []);

  const getAuctionStats = () => {
    if (!lances.length) {
      return {
        totalLances: 0,
        menorLance: 0,
        maiorLance: 0,
        lanceMedia: 0,
        economia: 0,
        economiaPercentual: 0
      };
    }

    const valores = lances.map(lance => lance.valor);
    const menorLance = Math.min(...valores);
    const maiorLance = Math.max(...valores);
    const lanceMedia = valores.reduce((acc, val) => acc + val, 0) / valores.length;
    const economia = leilao ? leilao.precoInicial - menorLance : 0;
    const economiaPercentual = leilao ? (economia / leilao.precoInicial) * 100 : 0;

    return {
      totalLances: lances.length,
      menorLance,
      maiorLance,
      lanceMedia,
      economia,
      economiaPercentual
    };
  };

  const stats = getAuctionStats();

  const getStatusInfo = (status: string) => {
    const statusMap = {
      'Ativo': { color: 'bg-green-100 text-green-800', label: 'Ativo' },
      'Encerrado': { color: 'bg-purple-100 text-purple-800', label: 'Encerrado' },
      'Cancelado': { color: 'bg-red-100 text-red-800', label: 'Cancelado' }
    };
    return statusMap[status as keyof typeof statusMap] || statusMap['Ativo'];
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR');
  };

  const handleSelectWinner = (lance: Lance) => {
    setSelectedWinner(lance);
    setShowWinnerModal(true);
  };

  const confirmWinner = async () => {
    if (!selectedWinner || !leilao || !selectedWinner.id) {
      console.error('Dados incompletos para confirmar vencedor');
      alert('Erro: Dados incompletos para confirmar vencedor');
      return;
    }

    try {
      await updateVencedor(selectedWinner.id, true);
      await fetchData(); // Sincronizar os dados do leilão com o backend

      const updatedLances = lances.map(lance => ({
        ...lance,
        vencedor: lance.id === selectedWinner.id
      }));

      setLances(updatedLances);
      setShowWinnerModal(false);
      setSelectedWinner(null);
      alert('Fornecedor vencedor definido com sucesso!');
    } catch (error) {
      console.error('Erro ao definir vencedor:', error);
      alert('Erro ao definir vencedor. Tente novamente.');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error || !leilao) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="bg-red-50 p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-red-700 mb-2">Erro ao carregar leilão</h2>
          <p className="text-red-600">{error || 'Leilão não encontrado'}</p>
          <button 
            onClick={() => navigate('/auctions')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Voltar ao Dashboard
          </button>
        </div>
      </div>
    );
  }

  const statusInfo = getStatusInfo(leilao.status);

  return (
    <div className="flex-1 p-6 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">{leilao.titulo}</h1>
              <p className="text-gray-600">{leilao.descricao}</p>
            </div>
            <div className="flex items-center space-x-4">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusInfo.color}`}>
                {statusInfo.label}
              </span>
              {leilao.status === 'Ativo' && (
                <div className="flex items-center text-green-600">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-2"></div>
                  <span className="text-sm font-medium">Ao Vivo</span>
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center p-4 bg-blue-50 rounded-lg">
            <img 
              src={leilao.produto.thumbnail} 
              alt={leilao.produto.titulo} 
              className="w-20 h-20 object-cover rounded mr-4"
            />
            <div className="flex-1">
              <h3 className="text-lg font-semibold">{leilao.produto.titulo}</h3>
              <p className="text-gray-600 text-sm">{leilao.produto.descricao}</p>
              <p className="text-gray-600 text-sm">Preço inicial: {formatCurrency(leilao.precoInicial)}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Início: {formatDateTime(leilao.dataInicio)}</p>
              <p className="text-sm text-gray-600">Término: {formatDateTime(leilao.dataTermino)}</p>
              <p className="text-sm text-gray-600">Entrega: {formatDateTime(leilao.dataEntrega)}</p>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total de Lances</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.totalLances}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100 text-green-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Menor Lance</p>
                <p className="text-2xl font-semibold text-gray-900">{formatCurrency(stats.menorLance)}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-yellow-100 text-yellow-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Lance Médio</p>
                <p className="text-2xl font-semibold text-gray-900">{formatCurrency(stats.lanceMedia)}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-100 text-purple-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Economia</p>
                <p className="text-2xl font-semibold text-gray-900">{formatCurrency(stats.economia)}</p>
                <p className="text-sm text-green-600">({stats.economiaPercentual.toFixed(1)}%)</p>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-800">
                Lances Recebidos ({lances.length})
              </h2>
              {leilao.status === 'Ativo' && (
                <button
                  onClick={fetchData}
                  className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Atualizar
                </button>
              )}
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fornecedor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Valor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Data/Hora
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Observação
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  {(leilao.status === 'Ativo' || leilao.status === 'Encerrado') && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ações
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {lances.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                      Nenhum lance recebido ainda
                    </td>
                  </tr>
                ) : (
                  lances
                    .sort((a, b) => a.valor - b.valor)
                    .map((lance, index) => (
                      <tr key={lance.id} className={lance.vencedor ? 'bg-green-50' : ''}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {lance.usuario.nome}
                          </div>
                          <div className="text-sm text-gray-500">
                            {lance.usuario.email}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {formatCurrency(lance.valor)}
                          </div>
                          {index === 0 && (
                            <div className="text-xs text-green-600 font-medium">
                              Melhor oferta
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDateTime(lance.dataCriacao)}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {lance.observacao || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {lance.vencedor ? (
                            <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                              Vencedor
                            </span>
                          ) : (
                            <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">
                              Participando
                            </span>
                          )}
                        </td>
                        {(leilao.status === 'Ativo' || leilao.status === 'Encerrado') && (
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            {!lance.vencedor && leilao.status === 'Ativo' && (
                              <button
                                onClick={() => handleSelectWinner(lance)}
                                className="text-blue-600 hover:text-blue-900"
                              >
                                Selecionar
                              </button>
                            )}
                          </td>
                        )}
                      </tr>
                    ))
                )}
              </tbody>
            </table>
          </div>
        </div>
        <div className="mt-6 flex justify-end space-x-3">
          <button
            onClick={() => navigate('/activeauctions')}
            className="py-2 px-4 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Voltar
          </button>
        </div>
        {showWinnerModal && selectedWinner && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Confirmar Vencedor
                </h3>
                <div className="bg-gray-50 p-4 rounded-md mb-4">
                  <p className="text-sm text-gray-600">Fornecedor:</p>
                  <p className="font-medium">{selectedWinner.usuario.nome}</p>
                  <p className="text-sm text-gray-600 mt-2">Valor do Lance:</p>
                  <p className="font-medium text-green-600">{formatCurrency(selectedWinner.valor)}</p>
                  {selectedWinner.observacao && (
                    <>
                      <p className="text-sm text-gray-600 mt-2">Observação:</p>
                      <p className="text-sm">{selectedWinner.observacao}</p>
                    </>
                  )}
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  Tem certeza que deseja selecionar este fornecedor como vencedor?
                </p>
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => {
                      setShowWinnerModal(false);
                      setSelectedWinner(null);
                    }}
                    className="py-2 px-4 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={confirmWinner}
                    className="py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700"
                  >
                    Confirmar Vencedor
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuctionMonitorPage;