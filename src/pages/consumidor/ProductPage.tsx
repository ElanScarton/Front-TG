import axios from "axios";
import { useEffect, useState } from "react"
import { useNavigate, useParams } from 'react-router-dom';

interface Product {
    id: number
    title: string
    description: string
    price: number;
    rating: number;
    images: string[];
}

const ProductPage = () => {
    const {id} = useParams<{id: string}>();
    const navigate = useNavigate()
    const [product, setProduct] = useState<Product | null>(null);

    const handleCreateAuction = () => {
        navigate(`/product/${id}/create-auction`);
      };

    useEffect(()=>
    {
        if (id) {
            axios
             .get<Product>(`https://dummyjson.com/products/${id}`)
             .then(response => {
                setProduct(response.data)
            }).catch(error => {
                console.error(`Error getching product data: ${error}`);
            });
        }
    }, [id]);

    if (!product) {
        return <h1>Loading...</h1>
    }

    return <div className="p-5 w-[60%] ml-[28rem]">

        <button 
        onClick={handleCreateAuction}
        className="mt-4 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded flex items-center"
      >
        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
        Criar Pregão Online
      </button>

        <img src={product.images[0]} alt={product.title} className="w-[50%] h-auto mb-5" />

        <h1 className="text-2x1 mb-4 font-bold">{product.title}</h1>
        <p className="mb-4 text-gray-700 w-[70%]">{product.description}</p>
        <div className="flex">
            <p>Price: R${product.price}</p>
            <p className="ml-10">Rating: {product.rating}</p>
        </div>
        </div>
};

export default ProductPage