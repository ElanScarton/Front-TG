import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Handshake } from 'lucide-react';

const WelcomePage: React.FC = () => {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  const slides = [
    {
      title: "Economia Comprovada",
      description: "R$ 7,9 bilhões economizados pelo governo federal com pregão eletrônico",
      icon: "💰"
    },
    {
      title: "Competição Inteligente",
      description: "Fornecedores competem pelos melhores preços automaticamente",
      icon: "🏆"
    },
    {
      title: "Integração contínua com ERP",
      description: "Seu sistema ERP integrado ao site",
      icon: "📊"
    }
  ];

  useEffect(() => {
    setIsVisible(true);
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-white text-gray-800 overflow-hidden">
  {/* Background Elements */}
  <div className="absolute inset-0 overflow-hidden">
    <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-100 rounded-full filter blur-3xl opacity-20"></div>
    <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-200 rounded-full filter blur-3xl opacity-20"></div>
    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-100 rounded-full filter blur-3xl opacity-10"></div>
  </div>

  {/* Header */}
  <header className="relative z-10 w-full py-6 px-8 bg-white border-b border-gray-200">
    <nav className="flex justify-between items-center max-w-7xl mx-auto">
      <div className="flex items-center space-x-3">
        <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
          <Handshake className="h-6 w-6 text-white" />
        </div>
        <span className="text-2xl font-bold text-blue-600">Procureasy</span>
      </div>

      <div className="flex items-center space-x-6">
        <a href="#sobre" className="text-gray-600 hover:text-blue-600 transition">
          Sobre
        </a>
        <button 
          className="px-6 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition"
          onClick={() => navigate('/login')}
        >
          Login
        </button>
      </div>
    </nav>
  </header>

  {/* Hero Section */}
  <main className="relative z-10 flex-grow">
    <div className="max-w-7xl mx-auto px-8 py-16">
      <div className={`text-center mb-16 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        <h1 className="text-6xl md:text-7xl font-bold mb-8 leading-tight">
          <span className="text-blue-600">Revolução</span>
          <br />
          <span className="text-gray-800">em Pregões Online</span>
        </h1>

        <p className="text-xl md:text-2xl text-gray-600 mb-4 max-w-4xl mx-auto">
          Plataforma completa para leilões reversos automatizados com a necessidade da sua empresa
        </p>

        <p className="text-lg text-gray-500 mb-12 max-w-3xl mx-auto">
          Reduza custos, otimize processos e maximize a competição entre fornecedores
          para aquisição eficiente de materiais MRO
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
          <button 
            className="px-10 py-4 bg-blue-600 text-white font-bold text-lg rounded-full hover:bg-blue-700 transition"
          >
            Ver Demonstração
          </button>
        </div>
      </div>

      {/* Dynamic Stats */}
      <div className="mb-20">
        <div className="bg-gray-50 rounded-3xl p-8 border border-gray-200 max-w-2xl mx-auto shadow">
          <div className="text-center transition-all duration-500">
            <div className="text-6xl mb-4">{slides[currentSlide].icon}</div>
            <h3 className="text-2xl font-bold mb-2 text-blue-600">{slides[currentSlide].title}</h3>
            <p className="text-gray-600 text-lg">{slides[currentSlide].description}</p>
          </div>

          <div className="flex justify-center mt-6 space-x-2">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-3 h-3 rounded-full ${
                  index === currentSlide ? 'bg-blue-600 scale-110' : 'bg-gray-300 hover:bg-gray-400'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
        {[
          {
            icon: "🔗",
            title: "Integração ERP",
            description: "Conexão direta com seu sistema ERP para sincronização em tempo real"
          },
          {
            icon: "📈",
            title: "Analytics Avançado",
            description: "Relatórios detalhados e insights para otimização contínua de custos"
          },
          {
            icon: "🛡️",
            title: "Segurança Total",
            description: "Criptografia de ponta e conformidade com regulamentações governamentais"
          },
          {
            icon: "⚡",
            title: "Tempo Real",
            description: "Atualizações instantâneas de preços e status dos pregões em andamento"
          },
        ].map((feature, index) => (
          <div 
            key={index}
            className={`bg-gray-50 rounded-2xl p-6 border border-gray-200 hover:shadow-lg transition-all duration-500 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
            style={{ transitionDelay: `${index * 100}ms` }}
          >
            <div className="text-4xl mb-4">{feature.icon}</div>
            <h3 className="text-xl font-bold mb-3 text-blue-600">{feature.title}</h3>
            <p className="text-gray-600 text-sm">{feature.description}</p>
          </div>
        ))}
      </div>

      {/* Process Flow */}
      <div className="mb-20">
        <h2 className="text-4xl font-bold text-center mb-12 text-blue-600">
          Como Funciona
        </h2>

        <div className="flex flex-col md:flex-row justify-between items-center space-y-8 md:space-y-0 md:space-x-8">
          {[
            { step: "1", title: "Análise ERP", desc: "Sistema analisa suas necessidades automaticamente" },
            { step: "2", title: "Sugestão de pregão", desc: "Criação e publicação auxiliada do pregão" },
            { step: "3", title: "Competição", desc: "Fornecedores competem pelos melhores preços" },
            { step: "4", title: "Seleção refinada", desc: "Escolhas da aquisição com base em dashboards definidos" }
          ].map((item, index) => (
            <div key={index} className="text-center relative">
              <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center text-2xl font-bold mb-4 mx-auto text-white shadow-lg">
                {item.step}
              </div>
              <h3 className="text-xl font-bold mb-2 text-blue-600">{item.title}</h3>
              <p className="text-gray-600 text-sm">{item.desc}</p>

              {index < 3 && (
                <div className="hidden md:block absolute top-10 -right-12 w-8 h-0.5 bg-blue-400"></div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  </main>

  {/* Footer */}
  <footer className="relative z-10 bg-gray-50 border-t border-gray-200 py-12 px-8">
    <div className="max-w-7xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
        <div>
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <Handshake className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold text-blue-600">Procureasy</span>
          </div>
          <p className="text-gray-600 text-sm">
            Revolucionando a aquisição de materiais com tecnologia MRP avançada e pregões automatizados.
          </p>
        </div>

        <div>
          <h3 className="text-lg font-bold mb-4 text-blue-600">Produto</h3>
          <ul className="space-y-2 text-gray-600 text-sm">
            <li><a href="#" className="hover:text-blue-600">Recursos</a></li>
            <li><a href="#" className="hover:text-blue-600">Preços</a></li>
            <li><a href="#" className="hover:text-blue-600">Integração</a></li>
            <li><a href="#" className="hover:text-blue-600">API</a></li>
          </ul>
        </div>

        <div>
          <h3 className="text-lg font-bold mb-4 text-blue-600">Empresa</h3>
          <ul className="space-y-2 text-gray-600 text-sm">
            <li><a href="#" className="hover:text-blue-600">Sobre</a></li>
            <li><a href="#" className="hover:text-blue-600">Blog</a></li>
            <li><a href="#" className="hover:text-blue-600">Carreiras</a></li>
            <li><a href="#" className="hover:text-blue-600">Imprensa</a></li>
          </ul>
        </div>

        <div>
          <h3 className="text-lg font-bold mb-4 text-blue-600">Suporte</h3>
          <ul className="space-y-2 text-gray-600 text-sm">
            <li><a href="#" className="hover:text-blue-600">Ajuda</a></li>
            <li><a href="#" className="hover:text-blue-600">Documentação</a></li>
            <li><a href="#" className="hover:text-blue-600">Contato</a></li>
            <li><a href="#" className="hover:text-blue-600">Status</a></li>
          </ul>
        </div>
      </div>

      <div className="border-t border-gray-200 pt-8 flex flex-col md:flex-row justify-between items-center">
        <p className="text-gray-600 text-sm mb-4 md:mb-0">
          &copy; 2025 Procureasy. Todos os direitos reservados.
        </p>
        <div className="flex space-x-6 text-gray-600 text-sm">
          <a href="#" className="hover:text-blue-600">Termos de Uso</a>
          <a href="#" className="hover:text-blue-600">Política de Privacidade</a>
          <a href="#" className="hover:text-blue-600">Cookies</a>
        </div>
      </div>
    </div>
  </footer>
</div>

  );
};

export default WelcomePage;
