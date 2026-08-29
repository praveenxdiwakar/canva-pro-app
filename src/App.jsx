import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TelegramProvider } from './contexts/TelegramContext';
import AppLayout from './components/layout/AppLayout';

import FreeCanva from './pages/FreeCanva';
import Tasks from './pages/Tasks';
import Redeem from './pages/Redeem';
import ProUsers from './pages/ProUsers';
import RewardHistory from './pages/RewardHistory';
import Profile from './pages/Profile';
import Admin from './pages/Admin';

// Error Boundary to prevent blank white screens on mobile
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 20, background: '#fee2e2', color: '#b91c1c', minHeight: '100vh', fontFamily: 'sans-serif' }}>
          <h2 style={{ fontSize: 18, fontWeight: 'bold' }}>⚠️ Application Error</h2>
          <pre style={{ whiteSpace: 'pre-wrap', fontSize: 12, marginTop: 10, background: '#fff', padding: 10, borderRadius: 8 }}>
            {this.state.error?.toString()}
          </pre>
        </div>
      );
    }
    return this.props.children;
  }
}

const queryClient = new QueryClient();

export default function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TelegramProvider>
          <BrowserRouter>
            <Routes>
              <Route element={<AppLayout />}>
                <Route path="/" element={<FreeCanva />} />
                <Route path="/tasks" element={<Tasks />} />
                <Route path="/redeem" element={<Redeem />} />
                <Route path="/pro-users" element={<ProUsers />} />
                <Route path="/reward-history" element={<RewardHistory />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/admin" element={<Admin />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </TelegramProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}