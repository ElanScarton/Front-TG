import React, { useState, useEffect } from 'react';
import { User, Edit3, Save, X, LogOut, Calendar, Mail, Hash, FileText, Building, Lock } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getUserById, updateUser } from '../services/userService';

const Profile = () => {
  const { user, logout } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [profileData, setProfileData] = useState({
    nome: '',
    email: '',
    cpf: '',
    cnpj: '',
    senha: '',
    confirmSenha: '',
    dataCriacao: '',
    tipoUsuario: 0
  });
  const [originalData, setOriginalData] = useState({});

  // Carregar dados do perfil do usuário
  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        setLoading(true);
        const userData = await getUserById(user?.id);
        
        const formattedData = {
          nome: userData.nome || user?.nome || '',
          email: userData.email || user?.email || '',
          cpf: userData.cpf || '',
          cnpj: userData.cnpj || '',
          senha: '',
          confirmSenha: '',
          dataCriacao: userData.dataCriacao ? new Date(userData.dataCriacao).toLocaleDateString('pt-BR') : 'Não informado',
          tipoUsuario: userData.tipoUsuario || user?.userType || 0
        };
        console.log(userData)
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
          dataCriacao: 'Não informado',
          tipoUsuario: user?.userType || 0
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

  const getPasswordStrength = (password) => {
    if (!password) return { score: 0, text: '', color: '' };
    
    let score = 0;
    const checks = {
      length: password.length >= 8,
      upper: /[A-Z]/.test(password),
      lower: /[a-z]/.test(password),
      number: /\d/.test(password),
      symbol: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    };
    
    score = Object.values(checks).filter(Boolean).length;
    
    if (score < 3) return { score, text: 'Fraca', color: 'text-red-500' };
    if (score < 5) return { score, text: 'Média', color: 'text-yellow-500' };
    return { score, text: 'Forte', color: 'text-green-500' };
  };

  const validatePassword = (password) => {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    if (password.length < minLength) {
      return 'A senha deve ter no mínimo 8 caracteres.';
    }
    if (!hasUpperCase) {
      return 'A senha deve conter pelo menos uma letra maiúscula.';
    }
    if (!hasLowerCase) {
      return 'A senha deve conter pelo menos uma letra minúscula.';
    }
    if (!hasNumbers) {
      return 'A senha deve conter pelo menos um número.';
    }
    if (!hasSpecialChar) {
      return 'A senha deve conter pelo menos um símbolo (!@#$%^&*(),.?":{}|<>).';
    }
    
    return null; // Senha válida
  };

  const handleSaveClick = () => {
    // Validar senhas se foram preenchidas
    if (profileData.senha && profileData.senha !== profileData.confirmSenha) {
      alert('As senhas não coincidem!');
      return;
    }

    // Validar força da senha se uma nova senha foi informada
    if (profileData.senha && profileData.senha.trim() !== '') {
      const passwordError = validatePassword(profileData.senha);
      if (passwordError) {
        alert(`Senha inválida: ${passwordError}`);
        return;
      }
    }

    // Mostrar modal para solicitar senha atual
    setShowPasswordModal(true);
  };

  const handleSave = async () => {
  if (!currentPassword.trim()) {
    alert('Por favor, digite sua senha atual para confirmar as alterações.');
    return;
  }

  try {
    setLoading(true);
    
    const updateData = {
      nome: profileData.nome,
      email: profileData.email,
      cpf: profileData.cpf || '',
      cnpj: profileData.cnpj || '',
      tipoUsuario: profileData.tipoUsuario,
      senhaAtual: currentPassword
    };

    // CORREÇÃO: Só adicionar nova senha se foi realmente preenchida e é diferente de vazia
    if (profileData.senha && profileData.senha.trim() !== '') {
      updateData.senha = profileData.senha;
    }
    // Importante: Não enviar o campo senha se estiver vazio

    await updateUser(user?.id, updateData);
    
    // Atualizar dados originais (sem incluir as senhas)
    const newOriginalData = {
      ...profileData,
      senha: '',
      confirmSenha: ''
    };
    setOriginalData(newOriginalData);
    setProfileData(newOriginalData);
    
    setIsEditing(false);
    setShowPasswordModal(false);
    setCurrentPassword('');
    alert('Perfil atualizado com sucesso!');
  } catch (error) {
    console.error('Erro ao atualizar perfil:', error);
    
    let errorMessage = 'Erro ao atualizar perfil. Tente novamente.';
    
    if (error.response?.status === 401) {
      errorMessage = 'Senha atual incorreta. Verifique e tente novamente.';
    } else if (error.response?.status === 400) {
      // Erro de validação
      errorMessage = error.response?.data?.message || error.message || 'Dados inválidos. Verifique as informações.';
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    alert(errorMessage);
  } finally {
    setLoading(false);
  }
};

  const handleCancel = () => {
    setProfileData({ ...originalData });
    setIsEditing(false);
  };

  const handleModalCancel = () => {
    setShowPasswordModal(false);
    setCurrentPassword('');
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

  return (
    <>
      <div className="p-5 w-[60%] ml-[20rem]">
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
                    className="bg-black hover:bg-gray-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
                  >
                    <Edit3 className="h-4 w-4" />
                    <span>Editar</span>
                  </button>
                ) : (
                  <div className="flex space-x-2">
                    <button
                      onClick={handleSaveClick}
                      disabled={loading}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors disabled:opacity-50"
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
                        onChange={(e) => handleInputChange('nome', e.target.value)}
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
                        <div className="mt-1 flex items-center justify-between">
                          <p className="text-xs text-gray-500">
                            Mín. 8 caracteres, com maiúscula, minúscula, número e símbolo
                          </p>
                          {profileData.senha && (
                            <span className={`text-xs font-medium ${getPasswordStrength(profileData.senha).color}`}>
                              {getPasswordStrength(profileData.senha).text}
                            </span>
                          )}
                        </div>
                        {profileData.senha && (
                          <div className="w-full bg-gray-200 rounded-full h-1 mt-1">
                            <div 
                              className={`h-1 rounded-full transition-all duration-300 ${
                                getPasswordStrength(profileData.senha).score < 3 ? 'bg-red-500' :
                                getPasswordStrength(profileData.senha).score < 5 ? 'bg-yellow-500' : 'bg-green-500'
                              }`}
                              style={{ width: `${(getPasswordStrength(profileData.senha).score / 5) * 100}%` }}
                            />
                          </div>
                        )}
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

      {/* Modal de Confirmação de Senha */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center mb-4">
              <Lock className="h-6 w-6 text-gray-600 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">Confirmar Alterações</h3>
            </div>
            
            <p className="text-gray-600 mb-4">
              Para confirmar as alterações no seu perfil, digite sua senha atual:
            </p>
            
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-4"
              placeholder="Digite sua senha atual"
              autoFocus
            />
            
            <div className="flex space-x-3 justify-end">
              <button
                onClick={handleModalCancel}
                className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={loading || !currentPassword.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {loading ? 'Confirmando...' : 'Confirmar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Profile;