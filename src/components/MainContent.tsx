import { useEffect, useState } from "react"
import { useFilter } from "./FilterContext"
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

    // Calculate left margin or padding based on sidebar state
    const sidebarWidth = isExpanded ? "w-64" : "w-16";

    return(
        <div 
            className={`transition-all duration-300 ml-${isExpanded ? '64' : '16'}`}
            style={{ 
                marginLeft: isExpanded ? '16rem' : '4rem'  // 16rem (64) when expanded, 4rem (16) when collapsed
            }}
        >
    <section className="xl:w-[55rem] lg:w-[55rem] sm:w-[40rem] xs:w-[20rem] p-5">
        <div className="mb-5">
        <div className="flex flex-col sm:flex-row justify-between items-center">
            <div className="relative mb-5 mt-5">
                <button 
                 onClick={() => setDropdownOpen(!dropdownOpen)}
                 className="border px-4 py-2 rounded full flex items-center"
                 >
                    <Tally3 className="mr-2"/>

        {filter === 'all' ? 'Filter' : filter.charAt(0).toLowerCase() +filter.slice(1)}

                </button> {/* Cria o botão de filtrar por mais barato ou mais caro, acho que não será necessário, podemos colocar botão por ordem de prioridade */}

                {dropdownOpen && (
                    <div className="absolute bg-white border border-gray-300 rounded mt-2 w-full sm:w-40">
                        <button 
                         onClick={() => setFilter('cheap')} 
                         className="block px-4 py-2 w-full text-left hover:bg-gray-200"
                        >
                          Cheap
                        </button>
                        <button 
                         onClick={() => setFilter('expensive')} 
                         className="block px-4 py-2 w-full text-left hover:bg-gray-200"
                        >
                          Expensive
                        </button>
                        <button 
                         onClick={() => setFilter('popular')} 
                         className="block px-4 py-2 w-full text-left hover:bg-gray-200"
                        >
                          Popular
                        </button>
                    </div>
                )}
            </div>
        </div>

        <div className="grid grid-cols-4 sm:grid-cols-3 md:grid-cols-4 gap-5"> {/*o que estiver dentro desta div aparecerá nas opções de itens*/}
            {filteredProducts.map(product => (
                <BookCard key={product.od} id={product.id} title={product.title} image={product.thumbnail} price={product.price}/>
            ))}
        </div>

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
                      ? 'bg-black text-white' 
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
    </section>
    </div>
);
}
export default MainContent