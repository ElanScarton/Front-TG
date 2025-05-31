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
            ? "bg-green-600 text-white border-green-700"
            : "bg-gray-600 text-white border-gray-700";
    };

    const getStockStatus = (quantidade: number) => {
        if (quantidade === 0) return { text: "Sem estoque", color: "text-gray-600" };
        if (quantidade < 10) return { text: "Estoque baixo", color: "text-blue-600" };
        return { text: "Em estoque", color: "text-green-600" };
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
            <div className="flex justify-center items-center h-screen bg-gray-100"> {/* Fundo cinza bem claro */}
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-black mx-auto mb-4"></div> {/* Borda preta para contraste */}
                    <h1 className="text-2xl font-semibold text-gray-700">Carregando produto...</h1> {/* Texico cinza escuro */}
                </div>
            </div>
        );
    }

    if (error || !product) {
        return (
            <div className="flex justify-center items-center h-screen bg-gray-100"> {/* Fundo cinza bem claro */}
                <div className="text-center bg-white p-8 rounded-lg shadow-md"> {/* Fundo branco para card */}
                    <div className="text-gray-600 text-6xl mb-4">⚠️</div> {/* Ícone em cinza */}
                    <h1 className="text-2xl font-semibold text-gray-800 mb-4">
                        {error || "Produto não encontrado"}
                    </h1>
                    <button
                        onClick={handleBackToProducts}
                        className="bg-black hover:bg-gray-800 text-white px-6 py-2 rounded-lg transition-colors" // Botão preto com hover cinza
                    >
                        Voltar aos Produtos
                    </button>
                </div>
            </div>
        );
    }

    const stockStatus = getStockStatus(product.quantidade);

    return (
        <div className="p-8 max-w-3xl mx-auto  min-h-screen"> {/* Fundo cinza bem claro */}
            <div className="bg-white  rounded-lg p-6"> {/* Fundo branco para o card principal */}
                {/* Header com navegação */}
                <div className="mb-6">
                    <button
                        onClick={handleBackToProducts}
                        className="flex items-center text-gray-600 hover:text-black mb-4 transition-colors" // Texto cinza com hover preto
                    >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Voltar aos Produtos
                    </button>
                </div>

                {/* Card principal do produto */}
                <div className="bg-white shadow-lg rounded-xl overflow-hidden">
                    {/* Header do produto */}
                    <div className="bg-gradient-to-r from-black to-gray-700 px-8 py-6 text-white"> {/* Gradiente azul */}
                        <div className="flex justify-between items-start">
                            <div>
                                <h1 className="text-3xl font-bold mb-2">{product.nome}</h1>
                                <div className="flex items-center space-x-4">
                                    <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(product.ativo)}`}>
                                        {product.ativo ? '✅ Ativo' : '❌ Inativo'}
                                    </span>
                                    <span className="bg-white bg-opacity-20 px-3 py-1 rounded-full text-sm font-medium">
                                        📍 {product.area}
                                    </span>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-sm opacity-90">ID do Produto</div>
                                <div className="text-2xl font-bold">#{product.id}</div>
                            </div>
                        </div>
                    </div>

                    {/* Conteúdo principal */}
                    <div className="p-8">
                        {/* Informações principais */}
                        <div className="grid md:grid-cols-3 gap-6 mb-8">
                            {/* Valor */}
                            <div className="bg-gray-200 p-6 rounded-lg border border-gray-300"> {/* Fundo cinza mais claro */}
                                <div className="flex items-center mb-2">
                                    <span className="text-2xl mr-3">💰</span>
                                    <h3 className="text-lg font-semibold text-gray-800">Valor Unitário</h3> {/* Texto cinza escuro */}
                                </div>
                                <p className="text-3xl font-bold text-green-600">{formatCurrency(product.valor)}</p> {/* Valor em verde */}
                            </div>

                            {/* Estoque */}
                            <div className="bg-gray-200 p-6 rounded-lg border border-gray-300"> {/* Fundo cinza mais claro */}
                                <div className="flex items-center mb-2">
                                    <span className="text-2xl mr-3">📦</span>
                                    <h3 className="text-lg font-semibold text-gray-800">Estoque</h3>
                                </div>
                                <p className="text-3xl font-bold text-blue-600 mb-1">{product.quantidade}</p> {/* Quantidade em azul */}
                                <p className={`text-sm font-medium ${stockStatus.color}`}>{stockStatus.text}</p>
                            </div>

                            {/* Valor Total */}
                            <div className="bg-gray-200 p-6 rounded-lg border border-gray-300"> {/* Fundo cinza mais claro */}
                                <div className="flex items-center mb-2">
                                    <span className="text-2xl mr-3">💎</span>
                                    <h3 className="text-lg font-semibold text-gray-800">Valor Total</h3>
                                </div>
                                <p className="text-3xl font-bold text-green-600">
                                    {formatCurrency(product.valor * product.quantidade)}
                                </p>
                            </div>
                        </div>

                        {/* Descrição */}
                        <div className="mb-8">
                            <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                                <span className="text-2xl mr-3">📋</span>
                                Descrição do Produto
                            </h3>
                            <div className="bg-gray-200 p-6 rounded-lg border border-gray-300"> {/* Fundo cinza mais claro */}
                                <p className="text-gray-700 leading-relaxed text-lg">
                                    {product.descricao || "Nenhuma descrição disponível para este produto."}
                                </p>
                            </div>
                        </div>

                        {/* Informações de data */}
                        <div className="grid md:grid-cols-2 gap-6 mb-8">
                            <div className="bg-gray-200 p-4 rounded-lg border border-gray-300"> {/* Fundo cinza mais claro */}
                                <h4 className="font-semibold text-gray-800 mb-2 flex items-center">
                                    <span className="mr-2">📅</span>
                                    Data de Criação
                                </h4>
                                <p className="text-gray-600">{formatDate(product.dataCriacao)}</p>
                            </div>
                            <div className="bg-gray-200 p-4 rounded-lg border border-gray-300"> {/* Fundo cinza mais claro */}
                                <h4 className="font-semibold text-gray-800 mb-2 flex items-center">
                                    <span className="mr-2">🔄</span>
                                    Última Atualização
                                </h4>
                                <p className="text-gray-600">{formatDate(product.dataAtualizacao)}</p>
                            </div>
                        </div>

                        {/* Ações */}
                        <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-300">
                            <button
                                onClick={handleCreateAuction}
                                disabled={!product.ativo || product.quantidade === 0}
                                className="flex items-center justify-center bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-lg transition-colors"
                            >
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                                Criar Pregão Online
                            </button>

                            <button
                                onClick={handleBackToProducts}
                                className="flex items-center justify-center border-2 border-gray-300 hover:border-black text-gray-600 hover:text-black font-bold py-3 px-6 rounded-lg transition-colors" // Ajustado para cinza e hover preto
                            >
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                                Ver Todos os Produtos
                            </button>
                        </div>

                        {/* Aviso se produto inativo ou sem estoque */}
                        {(!product.ativo || product.quantidade === 0) && (
                            <div className="mt-6 bg-gray-200 border border-gray-300 rounded-lg p-4"> {/* Fundo cinza mais claro */}
                                <div className="flex items-center">
                                    <span className="text-gray-600 text-xl mr-3">⚠️</span>
                                    <div>
                                        <h4 className="font-semibold text-gray-800">Atenção</h4>
                                        <p className="text-gray-700">
                                            {!product.ativo && "Este produto está inativo. "}
                                            {product.quantidade === 0 && "Este produto está sem estoque. "}
                                            Não é possível criar pregões para este produto no momento.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductPage;