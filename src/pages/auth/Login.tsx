import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, UserType } from '../../contexts/AuthContext';

interface LoginFormData {
  email: string;
  senha: string; // Alterado de "password" para "senha" para corresponder ao backend
}

const Login = () => {
  const { login, getUserType } = useAuth(); // Extrair getUserType aqui no nível superior
  const navigate = useNavigate();
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    senha: '' // Alterado de "password" para "senha"
  });
  const [errors, setErrors] = useState<Partial<LoginFormData>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Limpar erros ao digitar
    if (errors[name as keyof LoginFormData]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
    setApiError(null);
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<LoginFormData> = {};
    
    if (!formData.email) {
      newErrors.email = 'Email é obrigatório';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }
    
    if (!formData.senha) {
      newErrors.senha = 'Senha é obrigatória';
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
        await login(formData.email, formData.senha);
        
        // Redirecionar com base no tipo de usuário
        const userType = getUserType(); // Usar a função extraída anteriormente
        
        if (userType === UserType.FORNECEDOR) {
          navigate('/list');
        } else if (userType === UserType.CONSUMIDOR) {
          navigate('/products');
        } else if (userType === UserType.ADMINISTRADOR) {
          navigate('/products'); // Ou qualquer outra rota admin
        } else {
          navigate('/products'); // Fallback
        }
      } catch (error) {
        console.error('Erro ao fazer login:', error);
        setApiError('Email ou senha incorretos');
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-md">
        <div>
          <h1 className="text-2xl font-bold text-center text-gray-900">Entre na sua conta</h1>
          <p className="mt-2 text-center text-gray-600">
            Ou{' '}
            <a 
              href="mailto:contato@procureasy.com" 
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              fale conosco por e-mail
            </a>
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
              <label htmlFor="senha" className="block text-sm font-medium text-gray-700">
                Senha
              </label>
              <input
                id="senha"
                name="senha"
                type="password"
                autoComplete="current-password"
                required
                value={formData.senha}
                onChange={handleChange}
                className={`mt-1 block w-full px-3 py-2 border ${
                  errors.senha ? 'border-red-500' : 'border-gray-300'
                } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
              />
              {errors.senha && <p className="mt-1 text-sm text-red-600">{errors.senha}</p>}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                Lembrar-me
              </label>
            </div>

            <div className="text-sm">
              <a href="#" className="font-medium text-blue-600 hover:text-blue-500">
                Esqueceu sua senha?
              </a>
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
              {isLoading ? 'Entrando...' : 'Entrar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;