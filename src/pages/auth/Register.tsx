  import { useState, FormEvent } from 'react';
  import { Link, useNavigate } from 'react-router-dom';
  import axios from 'axios'; // Ou use fetch nativo

  interface RegisterFormData {
    userId: string;
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
  }

  const Register = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState<RegisterFormData>({
      userId: '',
      name: '',
      email: '',
      password: '',
      confirmPassword: ''
    });
    const [errors, setErrors] = useState<Partial<RegisterFormData>>({});
    const [isLoading, setIsLoading] = useState(false);
    const [apiError, setApiError] = useState<string | null>(null);

    //tratamento de erros, fazendo mostrar mais claramente qual erro precisa ser corrigido
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      setFormData(prev => ({
        ...prev,
        [name]: value
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
      
      if (!formData.userId) {
        newErrors.userId = 'ID do usuário é obrigatório';
      }
      
      if (!formData.name) {
        newErrors.name = 'Nome é obrigatório';
      }
      
      if (!formData.email) {
        newErrors.email = 'Email é obrigatório';
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        newErrors.email = 'Email inválido';
      }
      
      if (!formData.password) {
        newErrors.password = 'Senha é obrigatória';
      } else if (formData.password.length < 6) {
        newErrors.password = 'A senha deve ter pelo menos 6 caracteres';
      }
      
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'As senhas não coincidem';
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
          // Remover campo confirmPassword antes de enviar para a API
          const { confirmPassword, ...registerData } = formData;
          
          // Opção 1: Usando axios
          const response = await axios.post(
            'https://sua-api.com/auth/register', 
            registerData
          );
          
          // Opção 2: Usando fetch
          /*
          const response = await fetch('https://sua-api.com/auth/register', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(registerData),
          });
          
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Falha no cadastro');
          }
          */
          
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
              setApiError('Email ou ID de usuário já cadastrado');
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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-md">
          <div>
            <h1 className="text-2xl font-bold text-center text-gray-900">Crie sua conta</h1>
            <p className="mt-2 text-center text-gray-600">
              Já tem uma conta?{' '}
              <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
                Entre aqui
              </Link>
            </p>
          </div>
          
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            {apiError && (
              <div className="bg-red-50 p-4 rounded-md">
                <p className="text-sm text-red-700">{apiError}</p>
              </div>
            )}
            
            <div className="space-y-4">
              <div>
                <label htmlFor="userId" className="block text-sm font-medium text-gray-700">
                  ID do Usuário
                </label>
                <input
                  id="userId"
                  name="userId"
                  type="text"
                  autoComplete="username"
                  required
                  value={formData.userId}
                  onChange={handleChange}
                  className={`mt-1 block w-full px-3 py-2 border ${
                    errors.userId ? 'border-red-500' : 'border-gray-300'
                  } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                />
                {errors.userId && <p className="mt-1 text-sm text-red-600">{errors.userId}</p>}
              </div>
              
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Nome Completo
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className={`mt-1 block w-full px-3 py-2 border ${
                    errors.name ? 'border-red-500' : 'border-gray-300'
                  } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                />
                {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
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
                  className={`mt-1 block w-full px-3 py-2 border ${
                    errors.email ? 'border-red-500' : 'border-gray-300'
                  } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                />
                {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
              </div>
              
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Senha
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className={`mt-1 block w-full px-3 py-2 border ${
                    errors.password ? 'border-red-500' : 'border-gray-300'
                  } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                />
                {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
              </div>
              
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                  Confirmar Senha
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`mt-1 block w-full px-3 py-2 border ${
                    errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                  } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                />
                {errors.confirmPassword && <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>}
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white ${
                  isLoading ? 'bg-black cursor-not-allowed' : 'bg-black hover:bg-black'
                } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
              >
                {isLoading ? 'Cadastrando...' : 'Cadastrar'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  export default Register;