import { useState, type FormEvent } from 'react';
import { Swords, Eye, EyeOff, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { signIn } = useAuth();
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [showPw,   setShowPw]   = useState(false);
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { error: authError } = await signIn(email.trim(), password);

    if (authError) {
      // Translate common Supabase errors to Portuguese
      const msg = authError.message.toLowerCase();
      if (msg.includes('invalid login') || msg.includes('invalid credentials') || msg.includes('wrong password')) {
        setError('Email ou senha incorretos.');
      } else if (msg.includes('email not confirmed')) {
        setError('Confirme seu email antes de entrar.');
      } else if (msg.includes('too many requests') || msg.includes('rate limit')) {
        setError('Muitas tentativas. Aguarde alguns minutos.');
      } else if (msg.includes('user not found') || msg.includes('no user found')) {
        setError('Email não encontrado.');
      } else if (msg.includes('signup') || msg.includes('sign_up') || msg.includes('disabled')) {
        setError('Acesso não autorizado. Contate o administrador.');
      } else {
        // Show raw error in production to help diagnose
        setError(`Erro: ${authError.message}`);
      }
      setLoading(false);
    }
    // On success: AuthContext updates session → App.tsx unmounts Login automatically
  };

  return (
    <div className="min-h-screen gradient-bg flex items-center justify-center p-4">
      {/* Background decorative orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-primary-600/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-secondary-600/20 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Card */}
        <div className="card-glass p-8 space-y-7">
          {/* Logo */}
          <div className="flex flex-col items-center gap-3">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center shadow-xl">
              <Swords size={28} className="text-white" />
            </div>
            <div className="text-center">
              <h1 className="text-3xl font-black gradient-text">RoutineDuel</h1>
              <p className="text-gray-400 text-sm mt-1">Rotina e hábitos em dupla ⚔️</p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Email</label>
              <input
                className="input"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoComplete="email"
                autoFocus
              />
            </div>

            <div>
              <label className="label">Senha</label>
              <div className="relative">
                <input
                  className="input pr-10"
                  type={showPw ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(p => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
                <AlertCircle size={16} className="flex-shrink-0" />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !email || !password}
              className="btn-primary w-full py-3 text-base"
            >
              {loading ? (
                <><Loader2 size={18} className="animate-spin" /> Entrando...</>
              ) : (
                'Entrar'
              )}
            </button>
          </form>

          <p className="text-center text-xs text-gray-600">
            Conta criada pelo administrador · Entre em contato se tiver problemas
          </p>
        </div>
      </div>
    </div>
  );
}
