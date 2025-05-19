// Atualize o arquivo App.tsx para incluir a nova rota
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import MainContent from "./components/MainContent";
import ProductPage from "./components/ProductPage";
import SidebarNav from "./components/SidebarNav";
import Login from "./components/Login";
import Register from "./components/Register";
import WelcomePage from "./components/WelcomePage";
import AuctionCreationPage from "./components/AuctionCreationPage"; // Importe o novo componente
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider } from "./contexts/AuthContext";
import { useState } from "react";
import AuctionListPage from "./components/AuctionListPage";
import AuctionBidPage from "./components/AuctionBidPage";

export default function App() {
  const [isExpanded, setIsExpanded] = useState(true);

  const handleSidebarToggle = (expanded) => {
    setIsExpanded(expanded);
  };

  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Página de boas-vindas pública como rota inicial */}
          <Route path="/" element={<WelcomePage />} />
          
          {/* Rotas públicas de autenticação */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Rotas protegidas da aplicação principal */}
          <Route element={<ProtectedRoute />}>
            <Route path="/products" element={
              <div className="flex h-screen">
                <Sidebar/>
                <div className="rounded w-full flex justify-between flex-wrap">
                  <MainContent isExpanded={isExpanded}/>
                </div>
                <div>
                  <SidebarNav isExpanded={isExpanded} onToggle={handleSidebarToggle}/>
                </div>
              </div>
            } />
            
            <Route path="/product/:id" element={
              <div className="flex h-screen">
                <div className="rounded w-full flex justify-between flex-wrap">
                  <ProductPage />
                </div>
                <div>
                  <SidebarNav isExpanded={isExpanded} onToggle={handleSidebarToggle}/>
                </div>
              </div>
            } />
            
            {/* Nova rota para criar pregão */}
            <Route path="/product/:id/create-auction" element={
              <div className="flex h-screen">
                <div className="rounded w-full flex justify-between flex-wrap">
                  <AuctionCreationPage />
                </div>
                <div>
                  <SidebarNav isExpanded={isExpanded} onToggle={handleSidebarToggle}/>
                </div>
              </div>
            } />
          

            <Route path="/list" element={
              <div className="flex h-screen">
                <div className="rounded w-full flex justify-between flex-wrap">
                  <AuctionListPage />
                </div>
                <div>
                  <SidebarNav isExpanded={isExpanded} onToggle={handleSidebarToggle}/>
                </div>
              </div>
            } />

            <Route path="/auctions/:id/bid" element={
              <div className="flex h-screen">
                <div className="rounded w-full flex justify-between flex-wrap">
                  <AuctionBidPage />
                </div>
                <div>
                  <SidebarNav isExpanded={isExpanded} onToggle={handleSidebarToggle}/>
                </div>
              </div>
            } />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}