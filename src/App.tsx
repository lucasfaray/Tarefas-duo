import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Swords, Loader2, AlertTriangle } from 'lucide-react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppProvider } from './context/AppContext';
import { supabaseMisconfigured } from './lib/supabase';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Habits from './pages/Habits';
import Tasks from './pages/Tasks';
import Duel from './pages/Duel';
import Stats from './pages/Stats';
import Settings from './pages/Settings';
import Login from './pages/Login';

// ─── Layout wrapper ───────────────────────────────────────────────────────────
function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen overflow-x-hidden">
      <Navbar />
      <main className="flex-1 lg:ml-64 pt-16 pb-20 lg:pt-0 lg:pb-0 min-h-screen overflow-x-hidden w-0">
        <div className="max-w-5xl mx-auto w-full">{children}</div>
      </main>
    </div>
  );
}

// ─── Full-screen loading ──────────────────────────────────────────────────────
function SplashLoading() {
  return (
    <div className="min-h-screen gradient-bg flex flex-col items-center justify-center gap-4">
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center shadow-xl">
        <Swords size={28} className="text-white" />
      </div>
      <Loader2 size={24} className="text-primary-400 animate-spin" />
      <p className="text-gray-500 text-sm">Carregando...</p>
    </div>
  );
}

// ─── Config error screen (shown when env vars are missing) ───────────────────
function ConfigError() {
  return (
    <div className="min-h-screen gradient-bg flex items-center justify-center p-6">
      <div className="w-full max-w-lg card-glass p-8 space-y-5 text-center">
        <div className="flex justify-center">
          <div className="w-14 h-14 rounded-2xl bg-red-500/20 border border-red-500/30 flex items-center justify-center">
            <AlertTriangle size={28} className="text-red-400" />
          </div>
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-100">Configuração incompleta</h1>
          <p className="text-gray-400 text-sm mt-2">
            As variáveis de ambiente do Supabase não foram encontradas neste deploy.
          </p>
        </div>
        <div className="text-left bg-gray-900 rounded-xl p-4 space-y-2 text-xs font-mono">
          <p className="text-gray-500 mb-3">Variáveis obrigatórias na Vercel:</p>
          {[
            'VITE_SUPABASE_URL',
            'VITE_SUPABASE_ANON_KEY',
            'VITE_DUO_ID',
          ].map(v => (
            <div key={v} className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0" />
              <span className="text-red-300">{v}</span>
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-600">
          Vercel → Project Settings → Environment Variables → adicione as 3 variáveis → Redeploy
        </p>
      </div>
    </div>
  );
}

// ─── Protected app ────────────────────────────────────────────────────────────
function ProtectedApp() {
  const { user } = useAuth();
  return (
    <AppProvider authUserId={user!.id}>
      <Routes>
        <Route path="/"         element={<Layout><Dashboard /></Layout>} />
        <Route path="/habits"   element={<Layout><Habits /></Layout>} />
        <Route path="/tasks"    element={<Layout><Tasks /></Layout>} />
        <Route path="/duel"     element={<Layout><Duel /></Layout>} />
        <Route path="/stats"    element={<Layout><Stats /></Layout>} />
        <Route path="/settings" element={<Layout><Settings /></Layout>} />
        <Route path="*"         element={<Navigate to="/" replace />} />
      </Routes>
    </AppProvider>
  );
}

// ─── Auth gate ────────────────────────────────────────────────────────────────
function AuthGate() {
  const { session, loading } = useAuth();
  if (loading)   return <SplashLoading />;
  if (!session)  return <Login />;
  return <ProtectedApp />;
}

// ─── Root ─────────────────────────────────────────────────────────────────────
export default function App() {
  // Guard #1: if env vars are missing, show config error BEFORE creating any
  // Supabase client (avoids the "supabaseUrl is required" uncaught crash).
  if (supabaseMisconfigured) return <ConfigError />;

  return (
    <BrowserRouter>
      <AuthProvider>
        <AuthGate />
      </AuthProvider>
    </BrowserRouter>
  );
}
