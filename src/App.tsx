import { Route, Routes, useLocation } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import MainContent from "./components/MainContent";
import ProductPage from "./pages/consumidor/ProductPage";
import SidebarNav from "./components/SidebarNav";
import Login from "./pages/auth/Login";
import Register from "./pages/adm/Register";
import WelcomePage from "./pages/WelcomePage";
import AuctionCreationPage from "./pages/consumidor/AuctionCreationPage";
import ProtectedRoute from "./routes/ProtectedRoute";
import { UserType } from "./contexts/AuthContext";
import { useState, useEffect } from "react";
import AuctionListPage from "./pages/consumidor/AuctionListPage";
import AuctionBidPage from "./pages/fornecedor/AuctionBidPage";
import Profile from "./pages/Profile";
import AuctionMonitorPage from "./pages/consumidor/AuctionMonitorPage";
import ActiveAuctions from "./pages/consumidor/ActiveAuctionsPage";
import AuctionHistory from "./pages/consumidor/HistoryAuctionsPage";

export default function App() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [forceCollapsed, setForceCollapsed] = useState(false);
  const location = useLocation();

  // Reset sidebar para fechado a cada mudança de rota
  useEffect(() => {
    setForceCollapsed(true);
    // Reset o forceCollapsed após um pequeno delay para permitir o efeito
    const timer = setTimeout(() => setForceCollapsed(false), 100);
    return () => clearTimeout(timer);
  }, [location.pathname]);

  const handleSidebarToggle = (expanded: boolean) => {
    setIsExpanded(expanded);
  };

  return (
    <Routes>
      {/* Página de boas-vindas pública como rota inicial */}
      <Route path="/" element={<WelcomePage />} />

      {/* Rotas públicas de autenticação */}
      <Route path="/login" element={<Login />} />
      

      {/* Rotas para Consumidores */}
      <Route element={<ProtectedRoute allowedTypes={[UserType.CONSUMIDOR, UserType.ADMINISTRADOR]} />}>
        <Route
          path="/products"
          element={
            <div className="flex h-screen">
              <Sidebar />
              <div className="rounded w-full flex justify-between flex-wrap">
                <MainContent isExpanded={isExpanded} />
              </div>
              <div>
                <SidebarNav onToggle={handleSidebarToggle} forceCollapsed={forceCollapsed} />
              </div>
            </div>
          }
        />

        <Route
          path="/product/:id"
          element={
            <div className="flex h-screen">
              <div className="rounded w-full flex justify-between flex-wrap">
                <ProductPage />
              </div>
              <div>
                <SidebarNav onToggle={handleSidebarToggle} forceCollapsed={forceCollapsed} />
              </div>
            </div>
          }
        />

        <Route
          path="/product/:id/create-auction"
          element={
            <div className="flex h-screen">
              <div className="rounded w-full flex justify-between flex-wrap">
                <AuctionCreationPage />
              </div>
              <div>
                <SidebarNav onToggle={handleSidebarToggle} forceCollapsed={forceCollapsed} />
              </div>
            </div>
          }
        />

      <Route
          path="/activeauctions"
          element={
            <div className="flex h-screen">
              <div className="rounded w-full flex justify-between flex-wrap">
                <ActiveAuctions />
              </div>
              <div>
                <SidebarNav onToggle={handleSidebarToggle} forceCollapsed={forceCollapsed} />
              </div>
            </div>
          }
      />
      
      <Route
          path="/auctionMonitorPage/:id"
          element={
            <div className="flex h-screen">
              <div className="rounded w-full flex justify-between flex-wrap">
                <AuctionMonitorPage />
              </div>
              <div>
                <SidebarNav onToggle={handleSidebarToggle} forceCollapsed={forceCollapsed} />
              </div>
            </div>
          }
        />

          <Route
          path="/auction-history"
          element={
            <div className="flex h-screen">
              <div className="rounded w-full flex justify-between flex-wrap">
                <AuctionHistory />
              </div>
              <div>
                <SidebarNav onToggle={handleSidebarToggle} forceCollapsed={forceCollapsed} />
              </div>
            </div>
          }
        />

        </Route>

      {/* Rotas para Administradores */}
      <Route element={<ProtectedRoute allowedTypes={[UserType.ADMINISTRADOR]} />}>
        
        <Route
          path="/register"
          element={
            <div className="flex h-screen">
              <div className="rounded w-full flex justify-between flex-wrap">
                <Register />
              </div>
              <div>
                <SidebarNav onToggle={handleSidebarToggle} forceCollapsed={forceCollapsed} />
              </div>
            </div>
          }
        />
      </Route>

      {/* Rotas para Fornecedores */}
      <Route element={<ProtectedRoute allowedTypes={[UserType.FORNECEDOR, UserType.ADMINISTRADOR]} />}>
        <Route
          path="/list"
          element={
            <div className="flex h-screen">
              <div className="rounded w-full flex justify-between flex-wrap">
                <AuctionListPage />
              </div>
              <div>
                <SidebarNav onToggle={handleSidebarToggle} forceCollapsed={forceCollapsed} />
              </div>
            </div>
          }
        />
      </Route>

      {/* Rotas acessíveis a Fornecedores e Administradores */}
      <Route element={<ProtectedRoute allowedTypes={[UserType.FORNECEDOR, UserType.ADMINISTRADOR, UserType.CONSUMIDOR]} />}>
        <Route
          path="/auctions/:id/bid"
          element={
            <div className="flex h-screen">
              <div className="rounded w-full flex justify-between flex-wrap">
                <AuctionBidPage />
              </div>
              <div>
                <SidebarNav onToggle={handleSidebarToggle} forceCollapsed={forceCollapsed} />
              </div>
            </div>
          }
        />
        <Route
          path="/settings"
          element={
            <div className="flex h-screen">
              <div className="rounded w-full flex justify-between flex-wrap">
                <Profile />
              </div>
              <div>
                <SidebarNav onToggle={handleSidebarToggle} forceCollapsed={forceCollapsed} />
              </div>
            </div>
          }
        />

      </Route>
    </Routes>
  );
}