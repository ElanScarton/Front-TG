// Atualize o arquivo App.tsx para incluir a nova rota
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import MainContent from "./components/MainContent";
import ProductPage from "./components/ProductPage";
import TopSellers from "./components/TopSellers";
import PopularBlogs from "./components/PopularBlogs";
import Login from "./components/Login";
import Register from "./components/Register";
import WelcomePage from "./components/WelcomePage";
import AuctionCreationPage from "./components/AuctionCreationPage"; // Importe o novo componente
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider } from "./contexts/AuthContext";

export default function App() {
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
                  <MainContent />
                </div>
                <div>
                  <TopSellers />
                  <PopularBlogs/>
                </div>
              </div>
            } />
            
            <Route path="/product/:id" element={
              <div className="flex h-screen">
                <Sidebar/>
                <div className="rounded w-full flex justify-between flex-wrap">
                  <ProductPage />
                </div>
                <div>
                  <TopSellers />
                  <PopularBlogs/>
                </div>
              </div>
            } />
            
            {/* Nova rota para criar pregão */}
            <Route path="/product/:id/create-auction" element={
              <div className="flex h-screen">
                <Sidebar/>
                <div className="rounded w-full flex justify-between flex-wrap">
                  <AuctionCreationPage />
                </div>
              </div>
            } />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}