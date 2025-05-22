import { Route, Routes } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import MainContent from "./components/MainContent";
import ProductPage from "./pages/consumidor/ProductPage";
import SidebarNav from "./components/SidebarNav";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import WelcomePage from "./pages/WelcomePage";
import AuctionCreationPage from "./pages/consumidor/AuctionCreationPage";
import ProtectedRoute from "./routes/ProtectedRoute";
import { UserType } from "./contexts/AuthContext";
import { useState } from "react";
import AuctionListPage from "./pages/consumidor/AuctionListPage";
import AuctionBidPage from "./pages/fornecedor/AuctionBidPage";
import Profile from "./pages/profile";

export default function App() {
  const [isExpanded, setIsExpanded] = useState(true);

  const handleSidebarToggle = (expanded: boolean) => {
    setIsExpanded(expanded);
  };

  return (
    <Routes>
      {/* Página de boas-vindas pública como rota inicial */}
      <Route path="/" element={<WelcomePage />} />

      {/* Rotas públicas de autenticação */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

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
                <SidebarNav onToggle={handleSidebarToggle} />
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
                <SidebarNav onToggle={handleSidebarToggle} />
              </div>
            </div>
          }
        />

        <Route
          path="/profile"
          element={
            <div className="flex h-screen">
              <div className="rounded w-full flex justify-between flex-wrap">
                <Profile />
              </div>
              <div>
                <SidebarNav onToggle={handleSidebarToggle} />
              </div>
            </div>
          }
        />
      </Route>

      {/* Rotas para Administradores */}
      <Route element={<ProtectedRoute allowedTypes={[UserType.ADMINISTRADOR]} />}>
        <Route
          path="/product/:id/create-auction"
          element={
            <div className="flex h-screen">
              <div className="rounded w-full flex justify-between flex-wrap">
                <AuctionCreationPage />
              </div>
              <div>
                <SidebarNav onToggle={handleSidebarToggle} />
              </div>
            </div>
          }
        />
        <Route
          path="/profile"
          element={
            <div className="flex h-screen">
              <div className="rounded w-full flex justify-between flex-wrap">
                <Profile />
              </div>
              <div>
                <SidebarNav onToggle={handleSidebarToggle} />
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
                <SidebarNav onToggle={handleSidebarToggle} />
              </div>
            </div>
          }
        />
        <Route
          path="/profile"
          element={
            <div className="flex h-screen">
              <div className="rounded w-full flex justify-between flex-wrap">
                <Profile />
              </div>
              <div>
                <SidebarNav onToggle={handleSidebarToggle} />
              </div>
            </div>
          }
        />
      </Route>

      {/* Rotas acessíveis a Fornecedores e Administradores */}
      <Route element={<ProtectedRoute allowedTypes={[UserType.FORNECEDOR, UserType.ADMINISTRADOR]} />}>
        <Route
          path="/auctions/:id/bid"
          element={
            <div className="flex h-screen">
              <div className="rounded w-full flex justify-between flex-wrap">
                <AuctionBidPage />
              </div>
              <div>
                <SidebarNav onToggle={handleSidebarToggle} />
              </div>
            </div>
          }
        />
        <Route
          path="/profile"
          element={
            <div className="flex h-screen">
              <div className="rounded w-full flex justify-between flex-wrap">
                <Profile />
              </div>
              <div>
                <SidebarNav onToggle={handleSidebarToggle} />
              </div>
            </div>
          }
        />
      </Route>
    </Routes>
  );
}