import { useEffect, useState } from "react";
import { useFilter } from "../contexts/FilterContext";
import { ChevronDown, ChevronUp } from 'lucide-react';
import { getProducts } from "../services/productService";
import { useNavigate } from "react-router-dom";

// Adicione esta interface
interface MainContentProps {
isExpanded: boolean;
}

    const MainContent = ({ isExpanded }: MainContentProps) => {
    const { searchQuery, selectedCategory, minPrice, maxPrice, keyword } = useFilter();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [products, setProducts] = useState<any[]>([]);
    const [filter, setFilter] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const itemsPerPage = 12;
    const navigate = useNavigate();

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const data = await getProducts();
                setProducts(data);
            } catch (error) {
                console.error("Erro ao buscar produtos:", error);
            }
        };

        fetchProducts();
    }, []);

    const getFilteredProducts = () => {
        let filteredProducts = products;

        if (selectedCategory) {
            filteredProducts = filteredProducts.filter(
                (product) => product.area?.toLowerCase() === selectedCategory.toLowerCase()
            );
        }

        if (minPrice !== undefined) {
            filteredProducts = filteredProducts.filter(product => product.valor >= minPrice);
        }

        if (maxPrice !== undefined) {
            filteredProducts = filteredProducts.filter(product => product.valor <= maxPrice);
        }

        if (searchQuery) {
            filteredProducts = filteredProducts.filter(product =>
                product.nome.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        if (keyword) {
            filteredProducts = filteredProducts.filter(product =>
                product.nome.toLowerCase().includes(keyword.toLowerCase())
            );
        }

        switch (filter) {
            case "expensive":
                return filteredProducts.sort((a, b) => b.valor - a.valor);
            case "cheap":
                return filteredProducts.sort((a, b) => a.valor - b.valor);
            case "popular":
                return filteredProducts.sort((a, b) => b.quantidade - a.quantidade);
            default:
                return filteredProducts;
        }
    };

    const filteredProducts = getFilteredProducts();

    const totalProducts = filteredProducts.length;
    const totalPages = Math.ceil(totalProducts / itemsPerPage);

    const handlePageChange = (page: number) => {
        if (page > 0 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    const paginatedProducts = filteredProducts.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const getPaginationButtons = () => {
        const buttons: number[] = [];
        let startPage = Math.max(1, currentPage - 2);
        let endPage = Math.min(totalPages, currentPage + 2);

        if (currentPage - 2 < 1) {
            endPage = Math.min(totalPages, endPage + (2 - (currentPage - 1)));
        }

        if (currentPage + 2 > totalPages) {
            startPage = Math.max(1, startPage - ((currentPage + 2) - totalPages));
        }

        for (let page = startPage; page <= endPage; page++) {
            buttons.push(page);
        }

        return buttons;
    };

    return (
        <div
            className={`transition-all duration-300 flex-1 p-6 bg-gray-50`}
            style={{
                marginLeft: isExpanded ? '6rem' : '0rem'
            }}
        >
            <div className="max-w-4xl mx-auto ml-48">
                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Catálogo de Produtos</h1>
                    <p className="text-gray-600">Explore nossa seleção de produtos</p>
                </div>

                {/* Sort Dropdown */}
                <div className="flex justify-end mb-4 relative">
                    <button
                        onClick={() => setDropdownOpen(!dropdownOpen)}
                        className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 transition"
                    >
                        Ordenar
                        {dropdownOpen ? <ChevronUp className="w-4 h-4 ml-2" /> : <ChevronDown className="w-4 h-4 ml-2" />}
                    </button>

                    {dropdownOpen && (
                        <div className="absolute right-0 mt-10 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-10">
                            <button
                                onClick={() => { setFilter('all'); setDropdownOpen(false); }}
                                className={`block w-full text-left px-4 py-2 text-sm ${filter === 'all' ? 'bg-blue-100' : 'hover:bg-gray-100'}`}
                            >
                                Padrão
                            </button>
                            <button
                                onClick={() => { setFilter('expensive'); setDropdownOpen(false); }}
                                className={`block w-full text-left px-4 py-2 text-sm ${filter === 'expensive' ? 'bg-blue-100' : 'hover:bg-gray-100'}`}
                            >
                                Mais caros
                            </button>
                            <button
                                onClick={() => { setFilter('cheap'); setDropdownOpen(false); }}
                                className={`block w-full text-left px-4 py-2 text-sm ${filter === 'cheap' ? 'bg-blue-100' : 'hover:bg-gray-100'}`}
                            >
                                Mais baratos
                            </button>
                            <button
                                onClick={() => { setFilter('popular'); setDropdownOpen(false); }}
                                className={`block w-full text-left px-4 py-2 text-sm ${filter === 'popular' ? 'bg-blue-100' : 'hover:bg-gray-100'}`}
                            >
                                Mais populares
                            </button>
                        </div>
                    )}
                </div>

                <div className="space-y-4 mb-8">
                    {paginatedProducts.length === 0 ? (
                        <div className="col-span-full text-center py-12">
                            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum produto encontrado</h3>
                            <p className="text-gray-500">Ajuste os filtros ou tente uma busca diferente.</p>
                        </div>
                    ) : (
                        paginatedProducts.map(product => (
                            <div
                                key={product.id}
                                className="flex items-center justify-between bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition"
                            >
                                <div>
                                    <h2 className="text-lg font-semibold text-gray-900">{product.nome}</h2>
                                    <p className="text-sm text-gray-500">
                                        Área: <span className="font-medium">{product.area}</span>
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        Quantidade disponível: <span className="font-medium">{product.quantidade}</span>
                                    </p>
                                </div>
                                <div className="flex items-center space-x-4">
                                    <div className="text-right">
                                        <p className="text-xl font-bold text-black">
                                            R$ {product.valor.toFixed(2)}
                                        </p>
                                        <p className="text-sm text-gray-400">por unidade</p>
                                    </div>
                                    <button
                                        className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-400 transition"
                                        onClick={() => navigate(`/product/${product.id}`)}
                                    >
                                        Detalhes
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <div className="flex justify-center">
                            <div className="flex items-center space-x-1">
                                <button
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    className="px-4 py-2 rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    Anterior
                                </button>

                                {getPaginationButtons().map(page => (
                                    <button
                                        key={page}
                                        onClick={() => handlePageChange(page)}
                                        className={`px-4 py-2 rounded-md transition-colors ${page === currentPage
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
                                    className="px-4 py-2 rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    Próximo
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MainContent;
