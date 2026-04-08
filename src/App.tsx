import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Swords, Loader2 } from 'lucide-react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppProvider } from './context/AppContext';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Habits from './pages/Habits';
import Tasks from './pages/Tasks';
import Duel from './pages/Duel';
import Stats from './pages/Stats';
import Settings from './pages/Settings';
import Login from './pages/Login';

// ─── Layout wrapper ──────────────────────────────────────────────────────────
function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <Navbar />
      <main className="flex-1 lg:ml-64 pt-16 pb-20 lg:pt-0 lg:pb-0 overflow-y-auto min-h-screen">
        <div className="max-w-5xl mx-auto">
          {children}
        </div>
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

// ─── Protected app (only rendered when session exists) ───────────────────────
function ProtectedApp() {
  const { user } = useAuth();

  return (
    // Pass the real Supabase user ID to AppProvider for sync attribution
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

// ─── Auth gate ───────────────────────────────────────────────────────────────
// This is the critical component: it blocks ALL app rendering until we know
// the auth state. There is NO way to bypass it into the app without a session.
function AuthGate() {
  const { session, loading } = useAuth();

  if (loading) return <SplashLoading />;
  if (!session)  return <Login />;
  return <ProtectedApp />;
}

// ─── Root ────────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AuthGate />
      </AuthProvider>
    </BrowserRouter>
  );
}
