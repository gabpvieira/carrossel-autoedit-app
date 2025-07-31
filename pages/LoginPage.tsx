import React, { useState, useContext } from 'react';
import { AuthContext } from '../components/auth/AuthContext';
import { Button } from '../components/Button';
import { Input } from '../components/ui/Input';
import { ptBR } from '../locales/pt-BR';
import { IconPhoto, IconLoader } from '../components/icons';

const LoginPage: React.FC = () => {
  const { login } = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    const success = await login(email, password);
    if (!success) {
      setError(ptBR.errorInvalidCredentials);
    }
    setIsLoading(false);
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4 text-white">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
            <IconPhoto className="h-16 w-16 mx-auto text-purple-300" />
            <h1 className="text-4xl font-bold text-white tracking-tight mt-4">{ptBR.appName}</h1>
        </div>

        <div className="glassmorphism p-8 rounded-2xl shadow-2xl">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-white">{ptBR.loginTitle}</h2>
            <p className="text-gray-300 mt-1">{ptBR.loginSubtitle}</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              id="email"
              type="email"
              label={ptBR.emailLabel}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input
              id="password"
              type="password"
              label={ptBR.passwordLabel}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            {error && <p className="text-sm text-red-400 text-center">{error}</p>}
            <Button type="submit" size="lg" className="w-full flex justify-center" disabled={isLoading}>
              {isLoading ? (
                <>
                    <IconLoader className="w-6 h-6 animate-spin mr-2" />
                    {ptBR.loginLoading}
                </>
              ) : (
                ptBR.loginButton
              )}
            </Button>
            <div className="text-center">
                <a href="#" className="text-sm font-medium text-purple-300 hover:text-purple-200 transition-colors">
                    {ptBR.forgotPassword}
                </a>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
