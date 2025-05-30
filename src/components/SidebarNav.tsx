import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, History, Home, Settings, ShoppingBag, Users, BookOpen, Handshake } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

interface NavItem {
  icon: React.ReactNode;
  label: string;
  id: string;
  path: string;
}

interface SidebarNavProps {
  onToggle?: (isExpanded: boolean) => void;
  forceCollapsed?: boolean; // Nova prop para forçar o estado
}

const SidebarNav: React.FC<SidebarNavProps> = ({ onToggle, forceCollapsed = false }) => {
  const { user } = useAuth();
  const [isExpanded, setIsExpanded] = useState(false); // Começa sempre fechado
  const [currentPath, setCurrentPath] = useState("");

  // Effect para forçar o collapse quando forceCollapsed muda
  useEffect(() => {
    if (forceCollapsed) {
      setIsExpanded(false);
    }
  }, [forceCollapsed]);

  useEffect(() => {
    setCurrentPath(window.location.pathname);
    
    const handleUrlChange = () => {
      setCurrentPath(window.location.pathname);
    };

    window.addEventListener("popstate", handleUrlChange);
    return () => {
      window.removeEventListener("popstate", handleUrlChange);
    };
  }, []);

  useEffect(() => {
    if (onToggle) {
      onToggle(isExpanded);
    }
  }, [isExpanded, onToggle]);

  const toggleSidebar = () => {
    const newExpandedState = !isExpanded;
    setIsExpanded(newExpandedState);
    if (onToggle) {
      onToggle(newExpandedState);
    }
  };

  const getUserTypeLabel = (userType: number | null | undefined): string => {
    switch (userType) {
      case 1: return 'Consumidor';
      case 2: return 'Fornecedor';
      case 3: return 'Administrador';
      default: return 'Não definido';
    }
  };

  // Define navItems based on user type
  const navItems: NavItem[] = (() => {
    const userType = getUserTypeLabel(user?.userType);

    switch (userType) {
      case 'Consumidor':
        return [
          { icon: <Home size={20} />, label: "Início", id: "home", path: "/products" },
          { icon: <ShoppingBag size={20} />, label: "Leilões Ativos", id: "active-auctions", path: "/activeauctions" },
          { icon: <History size={20} />, label: "Histórico de Leilão", id: "auction-history", path: "/auction-history" },
          { icon: <Settings size={20} />, label: "Configurações", id: "settings", path: "/settings" },
        ];
      case 'Fornecedor':
        return [
          { icon: <Home size={20} />, label: "Início", id: "home", path: "/products" },
          { icon: <BookOpen size={20} />, label: "Meus Lances", id: "my-bids", path: "/my-bids" },
          { icon: <Settings size={20} />, label: "Configurações", id: "settings", path: "/settings" },
        ];
      case 'Administrador':
        return [
          { icon: <Home size={20} />, label: "Início", id: "home", path: "/products" },
          { icon: <ShoppingBag size={20} />, label: "Leilões Ativos", id: "active-auctions", path: "/activeauctions" },
          { icon: <History size={20} />, label: "Histórico de Leilão", id: "auction-history", path: "/auction-history" },
          { icon: <Settings size={20} />, label: "Configurações", id: "settings", path: "/settings" },
          { icon: <Users size={20} />, label: "Adicionar", id: "register", path: "/register" },
        ];
      default:
        return [
          { icon: <Home size={20} />, label: "Início", id: "home", path: "/products" },
          { icon: <Settings size={20} />, label: "Configurações", id: "settings", path: "/settings" },
        ];
    }
  })();

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