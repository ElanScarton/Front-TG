import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { registerUser, validateCPF, validateCNPJ, formatCPF, formatCNPJ } from '../../services/userService';
import { UserType } from '../../contexts/AuthContext';
import axios from 'axios';
import { Building, FileText, Hash, Mail, User } from 'lucide-react';

interface RegisterFormData {
  nome: string;
  email: string;
  senha: string;
  confirmarSenha: string;
  tipoUsuario: UserType;
  cpf: string;
  cnpj: string;
}

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<RegisterFormData>({
    nome: '',
    email: '',
    senha: '',
    confirmarSenha: '',
    tipoUsuario: UserType.CONSUMIDOR,
    cpf: '',
    cnpj: ''
  });
  const [errors, setErrors] = useState<Partial<RegisterFormData>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Formatação automática para CPF e CNPJ
    let formattedValue = value;
    if (name === 'cpf' && value.length <= 14) {
      formattedValue = formatCPF(value);
    } else if (name === 'cnpj' && value.length <= 18) {
      formattedValue = formatCNPJ(value);
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: name === 'tipoUsuario' ? parseInt(value) : formattedValue
    }));
    
    // Limpar erros ao digitar
    if (errors[name as keyof RegisterFormData]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
    setApiError(null);
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<RegisterFormData> = {};
    
    if (!formData.nome.trim()) {
      newErrors.nome = 'Nome é obrigatório';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email é obrigatório';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }
    
    if (!formData.senha) {
      newErrors.senha = 'Senha é obrigatória';
    } else if (formData.senha.length < 6) {
      newErrors.senha = 'A senha deve ter pelo menos 6 caracteres';
    }
    
    if (formData.senha !== formData.confirmarSenha) {
      newErrors.confirmarSenha = 'As senhas não coincidem';
    }
    
    // Validação de CPF e CNPJ baseada no tipo de usuário
    if (formData.tipoUsuario === UserType.CONSUMIDOR) {
      if (!formData.cpf.trim()) {
        newErrors.cpf = 'CPF é obrigatório para consumidores';
      } else if (!validateCPF(formData.cpf)) {
        //newErrors.cpf = 'CPF inválido';
      }
    } else if (formData.tipoUsuario === UserType.FORNECEDOR) {
      if (!formData.cnpj.trim()) {
        newErrors.cnpj = 'CNPJ é obrigatório para fornecedores';
      } else if (!validateCNPJ(formData.cnpj)) {
        //newErrors.cnpj = 'CNPJ inválido';
      }
    } else if (formData.tipoUsuario === UserType.ADMINISTRADOR) {
      if (!formData.cpf.trim()) {
        newErrors.cpf = 'CPF é obrigatório para administradores';
      } else if (!validateCPF(formData.cpf)) {
        //newErrors.cpf = 'CPF inválido';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      setIsLoading(true);
      setApiError(null);
      
      try {
        // Preparar dados para envio
        const registerData = {
          nome: formData.nome.trim(),
          email: formData.email.trim(),
          senha: formData.senha,
          tipoUsuario: formData.tipoUsuario,
          cpf: (formData.tipoUsuario === UserType.CONSUMIDOR || formData.tipoUsuario === UserType.ADMINISTRADOR) ? formData.cpf.replace(/\D/g, '') : '',
          cnpj: formData.tipoUsuario === UserType.FORNECEDOR ? formData.cnpj.replace(/\D/g, '') : ''
        };
        
        // Chamar o serviço de registro
        await registerUser(registerData);
        
        // Redirecionar para a página de login após cadastro bem-sucedido
        navigate('/login', { 
          state: { 
            message: 'Cadastro realizado com sucesso! Faça login para continuar.' 
          } 
        });
      } catch (error) {
        console.error('Erro de cadastro:', error);
        
        // Tratamento de erros específicos
        if (axios.isAxiosError(error) && error.response) {
          // Checar erros específicos
          if (error.response.status === 409) {
            setApiError('Email, CPF ou CNPJ já cadastrado');
          } else if (error.response.status === 400) {
            setApiError('Dados inválidos. Verifique as informações fornecidas');
          } else {
            setApiError(error.response.data.message || 'Erro ao fazer cadastro');
          }
        } else {
          setApiError('Erro de conexão. Verifique sua internet');
        }
      } finally {
        setIsLoading(false);
      }
    }
  };

return (
  <div className="min-h-screen bg-gray-50 py-8 flex justify-center items-center w-full">
    <div className="max-w-4xl w-full px-4 sm:px-6 lg:px-8">
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
                  <h1 className="text-2xl font-bold text-white"> Registrar usuários</h1>
                  <p className="text-gray-100">
                    Cadastre funcionários ou fornecedores para realizar e participar de leilões
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Formulário de Cadastro */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Informações de Cadastro</h2>
          </div>
          <div className="p-6">
            <form className="space-y-6" onSubmit={handleSubmit}>
              {apiError && (
                <div className="bg-red-50 p-4 rounded-lg">
                  <p className="text-sm text-red-700">{apiError}</p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Nome */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <User className="h-4 w-4 inline mr-2" />
                    Nome Completo
                  </label>
                  <input
                    id="nome"
                    name="nome"
                    type="text"
                    autoComplete="name"
                    required
                    value={formData.nome}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border ${
                      errors.nome ? 'border-red-500' : 'border-gray-300'
                    } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                    placeholder="Digite seu nome completo"
                  />
                  {errors.nome && <p className="mt-1 text-sm text-red-600">{errors.nome}</p>}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Mail className="h-4 w-4 inline mr-2" />
                    Email
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border ${
                      errors.email ? 'border-red-500' : 'border-gray-300'
                    } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                    placeholder="Digite seu email"
                  />
                  {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
                </div>

                {/* Tipo de Usuário */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <User className="h-4 w-4 inline mr-2" />
                    Tipo de Usuário
                  </label>
                  <select
                    id="tipoUsuario"
                    name="tipoUsuario"
                    required
                    value={formData.tipoUsuario}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value={UserType.CONSUMIDOR}>Consumidor</option>
                    <option value={UserType.FORNECEDOR}>Fornecedor</option>
                    <option value={UserType.ADMINISTRADOR}>Administrador</option>
                  </select>
                </div>

                {/* CPF - Para Consumidor e Administrador */}
                {(formData.tipoUsuario === UserType.CONSUMIDOR || formData.tipoUsuario === UserType.ADMINISTRADOR) && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Hash className="h-4 w-4 inline mr-2" />
                      CPF
                    </label>
                    <input
                      id="cpf"
                      name="cpf"
                      type="text"
                      autoComplete="off"
                      required
                      value={formData.cpf}
                      onChange={handleChange}
                      placeholder="000.000.000-00"
                      maxLength={14}
                      className={`w-full px-3 py-2 border ${
                        errors.cpf ? 'border-red-500' : 'border-gray-300'
                      } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                    />
                    {errors.cpf && <p className="mt-1 text-sm text-red-600">{errors.cpf}</p>}
                  </div>
                )}

                {/* CNPJ - Apenas para Fornecedor */}
                {formData.tipoUsuario === UserType.FORNECEDOR && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Building className="h-4 w-4 inline mr-2" />
                      CNPJ
                    </label>
                    <input
                      id="cnpj"
                      name="cnpj"
                      type="text"
                      autoComplete="off"
                      required
                      value={formData.cnpj}
                      onChange={handleChange}
                      placeholder="00.000.000/0000-00"
                      maxLength={18}
                      className={`w-full px-3 py-2 border ${
                        errors.cnpj ? 'border-red-500' : 'border-gray-300'
                      } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                    />
                    {errors.cnpj && <p className="mt-1 text-sm text-red-600">{errors.cnpj}</p>}
                  </div>
                )}

                {/* Senha */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <FileText className="h-4 w-4 inline mr-2" />
                    Senha
                  </label>
                  <input
                    id="senha"
                    name="senha"
                    type="password"
                    autoComplete="new-password"
                    required
                    value={formData.senha}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border ${
                      errors.senha ? 'border-red-500' : 'border-gray-300'
                    } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                    placeholder="Digite sua senha"
                  />
                  {errors.senha && <p className="mt-1 text-sm text-red-600">{errors.senha}</p>}
                </div>

                {/* Confirmar Senha */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <FileText className="h-4 w-4 inline mr-2" />
                    Confirmar Senha
                  </label>
                  <input
                    id="confirmarSenha"
                    name="confirmarSenha"
                    type="password"
                    autoComplete="new-password"
                    required
                    value={formData.confirmarSenha}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border ${
                      errors.confirmarSenha ? 'border-red-500' : 'border-gray-300'
                    } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                    placeholder="Confirme sua senha"
                  />
                  {errors.confirmarSenha && (
                    <p className="mt-1 text-sm text-red-600">{errors.confirmarSenha}</p>
                  )}
                </div>
              </div>

              <div className="md:col-span-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-lg text-white ${
                    isLoading
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-black hover:bg-gray-800'
                  } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors`}
                >
                  {isLoading ? 'Cadastrando...' : 'Cadastrar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
);
}
export default Register;