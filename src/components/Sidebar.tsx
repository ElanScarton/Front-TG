import { useEffect, useState } from "react"
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
        <div className={`flex flex-col h-screen bg-white border-l w-64 fixed right-0 top-0 z-10 `}>
            {/* Header com botão de toggle */}
            <div className="flex items-center justify-between p-4 border-b bg-black text-white">
               <h2 className="text-lg font-medium">Filtros</h2>
            </div>
                <div className="flex-1 overflow-hidden p-4 ">
                    <h1 className="text-2xl font-bold mb-6 mt-2">React Store</h1>

                    <section>
                        <input 
                            type="text" 
                            className="border-2 rounded px-2 py-2 w-full mb-4" 
                            placeholder="Search Product" 
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                        />

                        <div className="flex justify-center items-center mb-6">
                            <input 
                                type="text" 
                                className="border-2 mr-2 px-5 py-3 mb-3 w-full" 
                                placeholder="Min" 
                                value={minPrice ?? ""}
                                onChange={handleMinPriceChange}
                            />
                    
                            <input 
                                type="text" 
                                className="border-2 mr-2 px-5 py-3 mb-3 w-full" 
                                placeholder="Max" 
                                value={maxPrice ?? ""}
                                onChange={handleMaxPriceChange}
                            />
                        </div>

                        {/* Categories Section*/}
                        <div className="mb-5">
                            <h2 className="text-xl font-semibold mb-3 pb-1 border-b">Categories</h2>
                        </div>

                        <section className="max-h-40 overflow-y-auto mb-4">
                            {categories.map((category, index) => (
                                <label key={index} className="block mb-2 hover:bg-gray-50 p-1 rounded cursor-pointer">
                                    <input
                                    type="radio"
                                    name="category"
                                    value={category} 
                                    onChange={() => handleRadioChangeCategories(category)}
                                    className="mr-2 w-[16px] h-[16px]"
                                    checked={selectedCategory == category}
                                    />
                                    {category.toUpperCase()}
                                </label>
                            ))}
                        </section>

                        {/* Keywords Section */}
                        <div className="mb-5 mt-4">
                            <h3 className="font-medium text-sm text-gray-600 mb-2">Palavras-chave</h3>
                            <div className="flex flex-wrap gap-2">
                                {keywords.map((keyword, index) => (
                                    <button
                                    key={index} 
                                     onClick={() => handleKeywordClick(keyword)}
                                     className="px-3 py-1 text-xs font-medium rounded-full bg-gray-100 text-balck hover:bg-blue-100 transition-colors"
                                    >
                                        {keyword.toUpperCase()}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <button
                        onClick={handleResetFilters}
                        className="w-full mb-[4rem] py-2 bg-black text-white rounded hover:bg-gray-800 transition-colors mt-5">Reset Filter</button>
                    </section>
                </div>
        </div>
    )
}
export default Sidebar