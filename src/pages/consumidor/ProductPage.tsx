import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getProducts } from "../../services/productService";

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
}

const ProductPage = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const handleCreateAuction = () => {
        navigate(`/product/${id}/create-auction`);
    };

    const handleBackToProducts = () => {
        navigate('/products');
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('pt-BR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusColor = (ativo: boolean) => {
        return ativo 
            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
            : "bg-gray-50 text-gray-600 border-gray-200";
    };

    const getStockStatus = (quantidade: number) => {
        if (quantidade === 0) return { text: "Sem estoque", color: "text-red-600", bg: "bg-red-50" };
        if (quantidade < 10) return { text: "Estoque baixo", color: "text-amber-600", bg: "bg-amber-50" };
        return { text: "Em estoque", color: "text-emerald-600", bg: "bg-emerald-50" };
    };

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                setLoading(true);
                setError(null);
                const products = await getProducts();
                const foundProduct = products.find((p: Product) => p.id === Number(id));
                
                if (!foundProduct) {
                    setError("Produto não encontrado");
                } else {
                    setProduct(foundProduct);
                }
            } catch (error) {
                console.error("Erro ao buscar produto:", error);
                setError("Erro ao carregar produto. Tente novamente.");
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchProduct();
        }
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 py-8">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-center min-h-screen">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-2 border-gray-300 border-t-blue-600 mx-auto mb-4"></div>
                            <p className="text-gray-600 font-medium">Carregando informações do produto...</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (error || !product) {
        return (
            <div className="min-h-screen bg-gray-50 py-8">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-center min-h-screen">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center max-w-md">
                            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                </svg>
                            </div>
                            <h2 className="text-xl font-semibold text-gray-900 mb-2">
                                {error || "Produto não encontrado"}
                            </h2>
                            <p className="text-gray-600 mb-6">
                                O produto solicitado não está disponível no momento.
                            </p>
                            <button
                                onClick={handleBackToProducts}
                                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                Voltar aos Produtos
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    const stockStatus = getStockStatus(product.quantidade);

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Navegação */}
                <div className="mb-8">
                    <button
                        onClick={handleBackToProducts}
                        className="inline-flex items-center text-gray-600 hover:text-gray-900 font-medium transition-colors"
                    >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Voltar aos Produtos
                    </button>
                </div>

                {/* Card Principal */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-slate-900 to-slate-700 px-8 py-8">
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-3">
                                    <span className="text-gray-400 text-sm font-medium">ID #{product.id}</span>
                                    <div className="h-4 w-px bg-gray-500"></div>
                                    <span className="text-gray-300 text-sm">{product.area}</span>
                                </div>
                                <h1 className="text-3xl font-bold text-white mb-4">{product.nome}</h1>
                                <div className="flex flex-wrap items-center gap-3">
                                    <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium border ${getStatusColor(product.ativo)}`}>
                                        <span className={`w-2 h-2 rounded-full mr-2 ${product.ativo ? 'bg-emerald-500' : 'bg-gray-400'}`}></span>
                                        {product.ativo ? 'Ativo' : 'Inativo'}
                                    </span>
                                    <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium border ${stockStatus.bg} ${stockStatus.color} border-current border-opacity-20`}>
                                        {stockStatus.text}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Métricas Principais */}
                    <div className="p-8 border-b border-gray-200">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Valor Unitário */}
                            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="p-2 bg-blue-600 rounded-lg">
                                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                                        </svg>
                                    </div>
                                </div>
                                <p className="text-sm font-medium text-blue-700 mb-1">Valor Unitário</p>
                                <p className="text-2xl font-bold text-blue-900">{formatCurrency(product.valor)}</p>
                            </div>

                            {/* Estoque */}
                            <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl p-6 border border-emerald-200">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="p-2 bg-emerald-600 rounded-lg">
                                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                        </svg>
                                    </div>
                                </div>
                                <p className="text-sm font-medium text-emerald-700 mb-1">Quantidade em Estoque</p>
                                <p className="text-2xl font-bold text-emerald-900">{product.quantidade.toLocaleString()}</p>
                            </div>

                            {/* Valor Total */}
                            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="p-2 bg-purple-600 rounded-lg">
                                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                        </svg>
                                    </div>
                                </div>
                                <p className="text-sm font-medium text-purple-700 mb-1">Valor Total</p>
                                <p className="text-2xl font-bold text-purple-900">
                                    {formatCurrency(product.valor * product.quantidade)}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Descrição */}
                    <div className="p-8 border-b border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                            <svg className="w-5 h-5 mr-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            Descrição do Produto
                        </h3>
                        <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                            <p className="text-gray-700 leading-relaxed">
                                {product.descricao || "Nenhuma descrição disponível para este produto."}
                            </p>
                        </div>
                    </div>

                    {/* Informações de Data */}
                    <div className="p-8 border-b border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Informações de Controle</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                                <div className="flex items-center mb-3">
                                    <div className="p-2 bg-gray-600 rounded-lg mr-3">
                                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                    <h4 className="font-medium text-gray-900">Data de Criação</h4>
                                </div>
                                <p className="text-gray-700 font-mono text-sm">{formatDate(product.dataCriacao)}</p>
                            </div>
                            <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                                <div className="flex items-center mb-3">
                                    <div className="p-2 bg-gray-600 rounded-lg mr-3">
                                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                        </svg>
                                    </div>
                                    <h4 className="font-medium text-gray-900">Última Atualização</h4>
                                </div>
                                <p className="text-gray-700 font-mono text-sm">{formatDate(product.dataAtualizacao)}</p>
                            </div>
                        </div>
                    </div>

                    {/* Ações */}
                    <div className="p-8">
                        {/* Aviso se necessário */}
                        {(!product.ativo || product.quantidade === 0) && (
                            <div className="mb-6 bg-amber-50 border border-amber-200 rounded-lg p-4">
                                <div className="flex items-start">
                                    <div className="flex-shrink-0">
                                        <svg className="w-5 h-5 text-amber-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                        </svg>
                                    </div>
                                    <div className="ml-3">
                                        <h4 className="text-sm font-medium text-amber-800">Atenção</h4>
                                        <p className="text-sm text-amber-700 mt-1">
                                            {!product.ativo && "Este produto está inativo. "}
                                            {product.quantidade === 0 && "Este produto está sem estoque. "}
                                            Não é possível criar pregões para este produto no momento.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Botões de Ação */}
                        <div className="flex flex-col sm:flex-row gap-4">
                            <button
                                onClick={handleCreateAuction}
                                disabled={!product.ativo || product.quantidade === 0}
                                className="inline-flex items-center justify-center px-6 py-3 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                            >
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                                Criar Pregão Online
                            </button>

                            <button
                                onClick={handleBackToProducts}
                                className="inline-flex items-center justify-center px-6 py-3 bg-white text-gray-700 font-medium rounded-lg border border-gray-300 hover:bg-gray-50 hover:border-gray-400 transition-colors"
                            >
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                                </svg>
                                Ver Todos os Produtos
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductPage;