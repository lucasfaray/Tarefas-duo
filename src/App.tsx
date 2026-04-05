import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Habits from './pages/Habits';
import Tasks from './pages/Tasks';
import Duel from './pages/Duel';
import Stats from './pages/Stats';
import Settings from './pages/Settings';

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

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/"         element={<Layout><Dashboard /></Layout>} />
          <Route path="/habits"   element={<Layout><Habits /></Layout>} />
          <Route path="/tasks"    element={<Layout><Tasks /></Layout>} />
          <Route path="/duel"     element={<Layout><Duel /></Layout>} />
          <Route path="/stats"    element={<Layout><Stats /></Layout>} />
          <Route path="/settings" element={<Layout><Settings /></Layout>} />
          <Route path="*"         element={<Layout><Dashboard /></Layout>} />
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}
