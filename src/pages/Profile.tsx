import React, { useState, useEffect } from 'react';
import { User, Edit3, Save, X, LogOut, Calendar, Mail, Hash, FileText, Building } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import api from '../data/api';

const Profile = () => {
  const { user, logout } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState({
    nome: '',
    email: '',
    cpf: '',
    cnpj: '',
    senha: '',
    confirmSenha: '',
    dataCriacao: ''
  });
  const [originalData, setOriginalData] = useState({});

  // Carregar dados do perfil do usuário
  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/usuario/${user?.id}`);
        const userData = response.data;
        
        const formattedData = {
          nome: userData.nome || user?.nome || '',
          email: userData.email || user?.email || '',
          cpf: userData.cpf || '',
          cnpj: userData.cnpj || '',
          senha: '',
          confirmSenha: '',
          dataCriacao: userData.dataCriacao ? new Date(userData.dataCriacao).toLocaleDateString('pt-BR') : 'Não informado'
        };
        
        setProfileData(formattedData);
        setOriginalData(formattedData);
      } catch (error) {
        console.error('Erro ao carregar perfil:', error);
        // Se falhar, usar dados do contexto
        const fallbackData = {
          nome: user?.nome || '',
          email: user?.email || '',
          cpf: '',
          cnpj: '',
          senha: '',
          confirmSenha: '',
          dataCriacao: 'Não informado'
        };
        setProfileData(fallbackData);
        setOriginalData(fallbackData);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      loadUserProfile();
    }
  }, [user]);

  const handleInputChange = (field, value) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      
      // Validar senhas se foram preenchidas
      if (profileData.senha && profileData.senha !== profileData.confirmSenha) {
        alert('As senhas não coincidem!');
        return;
      }

      const updateData = {
        nome: profileData.nome,
        email: profileData.email,
        cpf: profileData.cpf,
        cnpj: profileData.cnpj
      };

      // Adicionar senha apenas se foi preenchida
      if (profileData.senha) {
        updateData.senha = profileData.senha;
      }

      await api.put(`/usuario/${user?.id}`, updateData);
      
      setOriginalData({ ...profileData });
      setIsEditing(false);
      alert('Perfil atualizado com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      alert('Erro ao atualizar perfil. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setProfileData({ ...originalData });
    setIsEditing(false);
  };

  const handleLogout = () => {
    if (window.confirm('Tem certeza que deseja sair?')) {
      logout();
    }
  };

  const getUserTypeLabel = (userType) => {
    switch (userType) {
      case 1: return 'Consumidor';
      case 2: return 'Fornecedor';
      case 3: return 'Administrador';
      default: return 'Não definido';
    }
  };

  if (loading && !profileData.nome) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando perfil...</p>
        </div>
      </div>
    );
  }

  return (<div className="p-5 w-[60%] ml-[20rem]">
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm mb-6 overflow-hidden">
          <div className="bg-gradient-to-r from-black to-gray-700 px-6 py-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="bg-white p-3 rounded-full">
                  <User className="h-8 w-8 text-black" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white">Meu Perfil</h1>
                  <p className="text-gray-100">{getUserTypeLabel(user?.userType)}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                <span>Sair</span>
              </button>
            </div>
          </div>
        </div>

        {/* Profile Form */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Informações Pessoais</h2>
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="bg-black hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
              >
                <Edit3 className="h-4 w-4" />
                <span>Editar</span>
              </button>
            ) : (
              <div className="flex space-x-2">
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className="bg-blue-600 hover:bg-blue-400 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors disabled:opacity-50"
                >
                  <Save className="h-4 w-4" />
                  <span>{loading ? 'Salvando...' : 'Salvar'}</span>
                </button>
                <button
                  onClick={handleCancel}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
                >
                  <X className="h-4 w-4" />
                  <span>Cancelar</span>
                </button>
              </div>
            )}
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Nome */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <User className="h-4 w-4 inline mr-2" />
                  Nome Completo
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={profileData.nome}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Digite seu nome completo"
                  />
                ) : (
                  <p className="px-3 py-2 bg-gray-50 rounded-lg text-gray-900">
                    {profileData.nome || 'Não informado'}
                  </p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Mail className="h-4 w-4 inline mr-2" />
                  Email
                </label>
                {isEditing ? (
                  <input
                    type="email"
                    value={profileData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Digite seu email"
                  />
                ) : (
                  <p className="px-3 py-2 bg-gray-50 rounded-lg text-gray-900">
                    {profileData.email || 'Não informado'}
                  </p>
                )}
              </div>

              {/* CPF */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Hash className="h-4 w-4 inline mr-2" />
                  CPF
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={profileData.cpf}
                    onChange={(e) => handleInputChange('cpf', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="000.000.000-00"
                    maxLength={14}
                  />
                ) : (
                  <p className="px-3 py-2 bg-gray-50 rounded-lg text-gray-900">
                    {profileData.cpf || 'Não informado'}
                  </p>
                )}
              </div>

              {/* CNPJ */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Building className="h-4 w-4 inline mr-2" />
                  CNPJ
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={profileData.cnpj}
                    onChange={(e) => handleInputChange('cnpj', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="00.000.000/0000-00"
                    maxLength={18}
                  />
                ) : (
                  <p className="px-3 py-2 bg-gray-50 rounded-lg text-gray-900">
                    {profileData.cnpj || 'Não informado'}
                  </p>
                )}
              </div>

              {/* Data de Criação */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="h-4 w-4 inline mr-2" />
                  Data de Cadastro
                </label>
                <p className="px-3 py-2 bg-gray-50 rounded-lg text-gray-900">
                  {profileData.dataCriacao}
                </p>
              </div>

              {/* Seção de Senha - Apenas no modo de edição */}
              {isEditing && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <FileText className="h-4 w-4 inline mr-2" />
                      Nova Senha
                    </label>
                    <input
                      type="password"
                      value={profileData.senha}
                      onChange={(e) => handleInputChange('senha', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Deixe em branco para manter a atual"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <FileText className="h-4 w-4 inline mr-2" />
                      Confirmar Nova Senha
                    </label>
                    <input
                      type="password"
                      value={profileData.confirmSenha}
                      onChange={(e) => handleInputChange('confirmSenha', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Confirme a nova senha"
                    />
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Informações Adicionais */}
        <div className="bg-white rounded-lg shadow-sm mt-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Informações da Conta</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">ID do Usuário</label>
                <p className="px-3 py-2 bg-gray-50 rounded-lg text-gray-900 font-mono text-sm">
                  {user?.id}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Conta</label>
                <p className="px-3 py-2 bg-gray-50 rounded-lg text-gray-900">
                  {getUserTypeLabel(user?.userType)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
};

export default Profile;