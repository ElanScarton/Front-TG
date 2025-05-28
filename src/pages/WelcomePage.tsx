import React from 'react';
import { Link } from 'react-router-dom';

const WelcomePage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-blue-50 to-white">
      {/* Header with navigation buttons */}
      <header className="w-full py-4 px-6 flex justify-end shadow-sm">
        <div className="space-x-4">
          <Link 
            to="/login"
            className="px-6 py-2 rounded-md bg-black text-white font-medium hover:bg-gray-700 transition duration-200"
          >
            Login
          </Link>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-grow flex flex-col items-center justify-center p-6">
        <div className="max-w-4xl text-center">
          {/* Logo/Icon placeholder */}
          <div className="mx-auto bg-black text-white w-24 h-24 rounded-full flex items-center justify-center mb-8">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          
          <h1 className="text-4xl font-bold mb-6 text-gray-800">Bem-vindo ao Procureasy</h1>
          
          <p className="text-xl mb-8 text-gray-600">
            Uma plataforma completa para realizar leiões reversos para itens estocaveis da sua empresa.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <div className="p-6 bg-white rounded-lg shadow-md">
              <div className="text-blue-600 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mx-auto" fill="none" viewBox="0 0 24 24" stroke="black">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold mb-2">Compra Segura</h2>
              <p className="text-gray-600">Pagamentos seguros e proteção ao comprador.</p>
            </div>
            
            <div className="p-6 bg-white rounded-lg shadow-md">
              <div className="text-blue-600 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mx-auto" fill="none" viewBox="0 0 24 24" stroke="black">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold mb-2">Conexão com o ERP</h2>
              <p className="text-gray-600">Milhares de produtos em diversas categorias para você escolher.</p>
            </div>
            
            <div className="p-6 bg-white rounded-lg shadow-md">
              <div className="text-blue-600 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mx-auto" fill="none" viewBox="0 0 24 24" stroke="black">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold mb-2">Entrega Rápida</h2>
              <p className="text-gray-600">Sistema de logística eficiente para entrega no menor tempo possível.</p>
            </div>
          </div>
          
          <div className="mt-8">
            <Link 
              to="/register" 
              className="inline-block px-8 py-3 bg-black text-white font-medium text-lg rounded-md hover:bg-gray-700 transition duration-200"
            >
              Comece Agora
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <p>&copy; 2025 MarketPlace. Todos os direitos reservados.</p>
          </div>
          <div className="flex space-x-4">
            <a href="#" className="hover:text-blue-300">Termos de Uso</a>
            <a href="#" className="hover:text-blue-300">Política de Privacidade</a>
            <a href="#" className="hover:text-blue-300">Contato</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default WelcomePage;