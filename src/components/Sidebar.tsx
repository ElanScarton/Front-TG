import { useEffect, useState } from "react"
import { Filter } from "lucide-react";
import { useFilter } from "../contexts/FilterContext";

interface Product {
    category: string;
}

interface FetchResponse {
    products: Product[]
}

const Sidebar = () => {
    const {
        searchQuery,
        setSearchQuery,
        selectedCategory,
        setSelectedCategory,
        minPrice,
        setMinPrice,
        maxPrice,
        setMaxPrice,
        setKeyword,
    } = useFilter();

    const [categories, setCategories] = useState<string[]>([]);
    const [keywords] = useState<string []>([
        "apple",
        "watch",
        "Fashion",
        "trend",
        "shoes",
        "shirt",
    ])

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await fetch('https://dummyjson.com/products')//no link podemos colocar o link da nossa api de produtos
                const data: FetchResponse = await response.json()
                const uniqueCategories = Array.from(
                    new Set(data.products.map(product => product.category))
                ); //seta para aparecer unicamente as categorias
                setCategories(uniqueCategories);
            } catch (error) {
                console.error('Error fetchin product', error)
            }
        };

        fetchCategories();
    }, [])



    const handleMinPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setMinPrice(value ? parseFloat(value) : undefined)
    }

    const handleMaxPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setMaxPrice(value ? parseFloat(value) : undefined)
    }

    const handleRadioChangeCategories = (category: string) => {
        setSelectedCategory(category)
    };

    const handleKeywordClick = (keyword: string) => {
        setKeyword(keyword);
    }

    const handleResetFilters = () => {
        setSearchQuery('')
        setSelectedCategory("")
        setMinPrice(undefined)
        setMaxPrice(undefined)
        setKeyword("");
    }

    return (
        <div className="flex flex-col h-screen bg-white border-r shadow-sm w-64 fixed right-0 top-0 z-10">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b">
                <h2 className="text-xl font-bold flex items-center gap-2 font-[Raleway]">
                    Filtros <Filter size={20}/>
                </h2>
            </div>

            {/* Conteúdo principal */}
            <div className="flex-1 overflow-y-auto p-4">
                <div className="mb-6">
                    <h1 className="text-lg font-semibold mb-4">React Store</h1>
                </div>

                <section className="space-y-6">
                    {/* Search */}
                    <div>
                        <input 
                            type="text" 
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                            placeholder="Search Product" 
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                        />
                    </div>

                    {/* Price Range */}
                    <div>
                        <h3 className="text-sm font-medium text-gray-700 mb-3">Faixa de Preço</h3>
                        <div className="flex gap-2">
                            <input 
                                type="text" 
                                className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                                placeholder="Min" 
                                value={minPrice ?? ""}
                                onChange={handleMinPriceChange}
                            />
                            <input 
                                type="text" 
                                className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                                placeholder="Max" 
                                value={maxPrice ?? ""}
                                onChange={handleMaxPriceChange}
                            />
                        </div>
                    </div>


                    {/* Categories Section*/}
                    <div>
                        <h3 className="text-sm font-medium text-gray-700 mb-3">Categorias</h3>
                        <div className="max-h-40 overflow-y-auto space-y-1">
                            {categories.map((category, index) => (
                                <label key={index} className="flex items-center p-2 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors">
                                    <input
                                        type="radio"
                                        name="category"
                                        value={category} 
                                        onChange={() => handleRadioChangeCategories(category)}
                                        className="mr-3 w-4 h-4 text-blue-600"
                                        checked={selectedCategory == category}
                                    />
                                    <span className="text-sm">{category.toUpperCase()}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Keywords Section */}
                    <div>
                        <h3 className="text-sm font-medium text-gray-700 mb-3">Palavras-chave</h3>
                        <div className="flex flex-wrap gap-2">
                            {keywords.map((keyword, index) => (
                                <button
                                    key={index} 
                                    onClick={() => handleKeywordClick(keyword)}
                                    className="px-3 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-700 hover:bg-blue-100 hover:text-blue-700 transition-colors"
                                >
                                    {keyword.toUpperCase()}
                                </button>
                            ))}
                        </div>
                    </div>
                </section>
            </div>

            {/* Footer com botão de reset */}
            <div className="p-4 border-t">
                <button
                    onClick={handleResetFilters}
                    className="w-full py-2 px-4 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium"
                >
                    Reset Filter
                </button>
            </div>
        </div>
    )
}

export default Sidebar