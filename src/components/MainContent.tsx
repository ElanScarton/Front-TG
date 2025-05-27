import { useEffect, useState } from "react"
import { useFilter } from "../contexts/FilterContext"
import { Tally3 } from 'lucide-react';
import  axios from "axios"
import BookCard from "./BookCard";

const MainContent = ({ isExpanded }) =>{
    const{searchQuery, selectedCategory, minPrice, maxPrice, keyword} = useFilter()

    const [products, setProducts] = useState<any[]>([]);
    const [filter, setFilter] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const itemsPerPage= 12;


    useEffect(() =>{
        let url = `https://dummyjson.com/products?limit=${itemsPerPage}&skip=${
            (currentPage  - 1) * itemsPerPage
        }`;

        if (keyword) {
            url = `https://dummyjson.com/products/search?q=${keyword}`
        }

        axios
         .get(url)
         .then(response =>{
            setProducts(response.data.products)

        })
         .catch(error => {
            console.error("Error fetching data", error);
        });
    }, [currentPage, keyword])

    const getFilteredProducts = () => { {/** Filtro para mostrar apenas os itens selecionados no category */}
        let filteredProducts = products

        if(selectedCategory){
            filteredProducts = filteredProducts.filter(
                (product) => product.category === selectedCategory
            );
        }

        if (minPrice !== undefined){
            filteredProducts = filteredProducts.filter(product => product.price > minPrice)
        }

        if (maxPrice !== undefined){
            filteredProducts = filteredProducts.filter(product => product.price <= maxPrice)
        }

        if(searchQuery){
            filteredProducts = filteredProducts.filter(product => product.title.toLowerCase().includes(searchQuery.toLowerCase()))
        }

        switch(filter){
            case "expensive":
                return filteredProducts.sort((a,b)=> b.price - a.price)
                case "cheap":
                    return filteredProducts.sort((a,b)=> a.price - b.price)
                    case "popular":
                        return filteredProducts.sort((a,b)=> b.rating - a.rating)
                        default:
                            return filteredProducts;
        }
    };

    const filteredProducts = getFilteredProducts()

    const totalProducts = 100;
    const totalPages = Math.ceil(totalProducts / itemsPerPage)

    const handlePageChange = (page:number)=> {
        if(page > 0 && page <= totalPages){
            setCurrentPage(page);
        }
    };

    const getPaginationButtons = () => {
        const buttons: number[]=[]
        let startPage =Math.max(1, currentPage -2 )
        let endPage = Math.min(totalPages, currentPage +2)

        if (currentPage - 2 <1){
            endPage = Math.min(totalPages, endPage + (2 - currentPage - 1));
        }

        
        if (currentPage + 2 > totalPages){
            startPage = Math.min(1, startPage - (2 - totalPages - currentPage))
        }
        
        for (let page = startPage; page <= endPage; page ++){
            buttons.push(page)
        }

        return buttons;
    }

    return(
        <div 
            className={`transition-all duration-300 ml-${isExpanded ? '64' : '16'} flex-1 p-6 bg-gray-50`}
            style={{ 
                marginLeft: isExpanded ? '2rem' : '0rem'  // 16rem (64) when expanded, 4rem (16) when collapsed
            }}
        >
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Catálogo de Produtos</h1>
                    <p className="text-gray-600">Explore nossa seleção de produtos com os melhores preços</p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <div className="flex items-center">
                            <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                </svg>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Total de Produtos</p>
                                <p className="text-2xl font-semibold text-gray-900">{products.length}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <div className="flex items-center">
                            <div className="p-3 rounded-full bg-green-100 text-green-600">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                                </svg>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Filtrados</p>
                                <p className="text-2xl font-semibold text-gray-900">{filteredProducts.length}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <div className="flex items-center">
                            <div className="p-3 rounded-full bg-purple-100 text-purple-600">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                                </svg>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Categoria</p>
                                <p className="text-2xl font-semibold text-gray-900">{selectedCategory || 'Todas'}</p>
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
                                <p className="text-sm font-medium text-gray-600">Página Atual</p>
                                <p className="text-2xl font-semibold text-gray-900">{currentPage} de {totalPages}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filters and Search */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
                        <div className="relative">
                            <button 
                                onClick={() => setDropdownOpen(!dropdownOpen)}
                                className="border border-gray-300 px-4 py-2 rounded-md flex items-center bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                            >
                                <Tally3 className="mr-2"/>
                                {filter === 'all' ? 'Filter' : filter.charAt(0).toUpperCase() + filter.slice(1)}
                            </button>

                            {dropdownOpen && (
                                <div className="absolute bg-white border border-gray-300 rounded-md mt-2 w-full sm:w-40 shadow-lg z-10">
                                    <button 
                                        onClick={() => {setFilter('all'); setDropdownOpen(false);}} 
                                        className="block px-4 py-2 w-full text-left hover:bg-gray-200"
                                    >
                                        Todos
                                    </button>
                                    <button 
                                        onClick={() => {setFilter('cheap'); setDropdownOpen(false);}} 
                                        className="block px-4 py-2 w-full text-left hover:bg-gray-200"
                                    >
                                        Mais Barato
                                    </button>
                                    <button 
                                        onClick={() => {setFilter('expensive'); setDropdownOpen(false);}} 
                                        className="block px-4 py-2 w-full text-left hover:bg-gray-200"
                                    >
                                        Mais Caro
                                    </button>
                                    <button 
                                        onClick={() => {setFilter('popular'); setDropdownOpen(false);}} 
                                        className="block px-4 py-2 w-full text-left hover:bg-gray-200"
                                    >
                                        Mais Popular
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="flex items-center space-x-4">
                            {searchQuery && (
                                <div className="text-sm text-gray-600">
                                    Buscando por: <span className="font-medium">"{searchQuery}"</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Products Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-8">
                    {filteredProducts.length === 0 ? (
                        <div className="col-span-full text-center py-12">
                            <div className="text-gray-400 mb-4">
                                <svg className="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum produto encontrado</h3>
                            <p className="text-gray-500">Ajuste os filtros ou tente uma busca diferente.</p>
                        </div>
                    ) : (
                        filteredProducts.map(product => (
                            <BookCard key={product.id} id={product.id} title={product.title} image={product.thumbnail} price={product.price}/>
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
                                        className={`px-4 py-2 rounded-md transition-colors ${
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
}
export default MainContent