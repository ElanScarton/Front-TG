import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, History, Home, Settings, ShoppingBag, Users, BookOpen, Handshake } from "lucide-react";
import { Navigate } from "react-router-dom";

const SidebarNav = ({ onToggle }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [currentPath, setCurrentPath] = useState("");

  useEffect(() => {
    // Obter a URL atual quando o componente é montado
    setCurrentPath(window.location.pathname);
    
    // Atualizar quando a URL mudar
    const handleUrlChange = () => {
      setCurrentPath(window.location.pathname);
    };

    // Adicionar event listener para detectar mudanças de URL
    window.addEventListener("popstate", handleUrlChange);
    
    // Limpar event listener quando o componente é desmontado
    return () => {
      window.removeEventListener("popstate", handleUrlChange);
    };
  }, []);

  const toggleSidebar = () => {
    const newExpandedState = !isExpanded;
    setIsExpanded(newExpandedState);
    if (onToggle) {
      onToggle(newExpandedState);
    }
  };

  // Initial state notification
  useEffect(() => {
    if (onToggle) {
      onToggle(isExpanded);
    }
  }, []);

  const navItems = [
    { icon: <Home size={20} />, label: "Início", id: "home", path: "/products" },
    { icon: <ShoppingBag size={20} />, label: "Leilões Ativos", id: "active-auctions", path: "/activeauctions" },
    { icon: <History size={20} />, label: "Histórico de Leilão", id: "auction-history", path: "/auction-history" },
    { icon: <BookOpen size={20} />, label: "Meus Lances", id: "my-bids", path: "/my-bids" },
    { icon: <Settings size={20} />, label: "Configurações", id: "settings", path: "/settings" },
    { icon: <Users size={20} />, label: "Adicionar", id: "register", path: "/register" }
  ];
  

  return (
    <div 
      className={`flex flex-col h-screen bg-white border-r shadow-sm transition-all duration-300 ${
        isExpanded ? "w-64" : "w-16"
      } fixed left-0 top-0 z-10`}
    >
      <div className="flex items-center justify-between p-4 border-b">
        {isExpanded && (
          <h2 className="text-xl font-bold flex items-center gap-2 font-[Raleway]">Procureasy <Handshake size={25}/></h2>
        )}
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-lg hover:bg-gray-100"
        >
          {isExpanded ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
        </button>
      </div>

      <nav className="flex-1 p-2">
        <ul className="space-y-2">
          {navItems.map((item) => {
            // Verifica se este item está ativo com base na URL atual
            const isActive = item.path === currentPath || 
                          (item.path.startsWith('/') && currentPath === item.path);
            
            return (
              <li key={item.id}>
                <a
                  href={item.path}
                  className={`flex items-center p-3 rounded-lg transition-colors ${
                    isActive 
                      ? "bg-blue-100 text-blue-700" 
                      : "hover:bg-gray-100"
                  }`}
                >
                  <div className={`flex items-center justify-center ${isActive ? "text-blue-700" : ""}`}>
                    {item.icon}
                  </div>
                  {isExpanded && <span className="ml-3">{item.label}</span>}
                </a>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-4 border-t">
        <button
          className={`flex items-center ${
            isExpanded ? "justify-start" : "justify-center"
          } w-full p-2 rounded-lg hover:bg-gray-100`}
        >
          <div className="flex items-center justify-center">
            <img 
              src="/api/placeholder/40/40" 
              alt="User" 
              className="w-8 h-8 rounded-full" 
            />
          </div>
          {isExpanded && <span className="ml-3">Usuário</span>}
        </button>
      </div>
    </div>
  );
};

export default SidebarNav;