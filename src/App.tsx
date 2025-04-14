import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './lib/auth-context';
import PrivateRoute from './components/layout/PrivateRoute';
import UserMenu from './components/layout/UserMenu';
import InstallPWA from './components/ui/InstallPWA';
import OfflineIndicator from './components/ui/OfflineIndicator';
import UpdateNotification from './components/ui/UpdateNotification';
import { initSync } from './lib/sync.service';
import { initDB } from './lib/db';
import { 
  Bell, 
  Search, 
  Menu,
  X,
  Zap
} from 'lucide-react';
import ErrorBoundary from './components/ErrorBoundary';
import { ToastProvider } from './components/ui/Toast';
import { SpeedInsights } from "@vercel/speed-insights/react";

// Layout Components
import Sidebar from './components/layout/Sidebar';
import MobileMenu from './components/layout/MobileMenu';

// Lazy loaded pages
const Login = lazy(() => import('./pages/auth/Login'));
const Register = lazy(() => import('./pages/auth/Register'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const NewInspection = lazy(() => import('./pages/NewInspection'));
const ClientSelection = lazy(() => import('./pages/inspection/ClientSelection'));
const BasicInfo = lazy(() => import('./pages/inspection/BasicInfo'));
const TileSelection = lazy(() => import('./pages/inspection/TileSelection'));
const NonConformities = lazy(() => import('./pages/inspection/NonConformities'));
const PhotoCapture = lazy(() => import('./pages/inspection/PhotoCapture'));
const ReviewAndFinalize = lazy(() => import('./pages/inspection/ReviewAndFinalize'));
const Reports = lazy(() => import('./pages/Reports'));
const Clients = lazy(() => import('./pages/Clients'));
const Calendar = lazy(() => import('./pages/Calendar'));
const ForgotPassword = lazy(() => import('./pages/auth/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/auth/ResetPassword'));

// Import skeletons
import DashboardSkeleton from './components/skeletons/DashboardSkeleton';
import CardSkeleton from './components/skeletons/CardSkeleton';
import TableSkeleton from './components/skeletons/TableSkeleton';

function App() {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  React.useEffect(() => {
    // Inicializar IndexedDB e serviço de sincronização
    initDB().then(() => {
      initSync();
    });
  }, []);

  return (
    <ErrorBoundary>
      <AuthProvider>
        <ToastProvider>
          <Router>
            <div className="min-h-screen bg-gray-100">
              <InstallPWA />
              <OfflineIndicator />
              <UpdateNotification />
              
              <Routes>
                {/* Rotas Públicas */}
                <Route path="/login" element={
                  <Suspense fallback={<CardSkeleton />}>
                    <Login />
                  </Suspense>
                } />
                <Route path="/register" element={
                  <Suspense fallback={<CardSkeleton />}>
                    <Register />
                  </Suspense>
                } />
                <Route path="/forgot-password" element={
                  <Suspense fallback={<CardSkeleton />}>
                    <ForgotPassword />
                  </Suspense>
                } />
                <Route path="/reset-password" element={
                  <Suspense fallback={<CardSkeleton />}>
                    <ResetPassword />
                  </Suspense>
                } />

                {/* Rotas Privadas */}
                <Route path="/" element={
                  <PrivateRoute>
                    <div className="flex h-screen overflow-hidden">
                      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
                      <div className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100">
                        <div className="relative z-10">
                          <header className="bg-white shadow-sm">
                            <div className="px-4 sm:px-6 lg:px-8">
                              <div className="flex items-center justify-between h-16">
                                <button
                                  type="button"
                                  className="lg:hidden text-gray-500 hover:text-gray-600"
                                  onClick={() => setSidebarOpen(true)}
                                >
                                  <Menu className="h-6 w-6" />
                                </button>
                                <div className="flex-1 lg:flex lg:items-center lg:justify-between">
                                  <div className="flex-1 min-w-0">
                                    {/* Barra de pesquisa pode ser adicionada aqui */}
                                  </div>
                                  <div className="flex items-center space-x-4">
                                    <UserMenu />
                                  </div>
                                </div>
                              </div>
                            </div>
                          </header>
                          <main className="flex-1 relative pb-8 z-0 overflow-y-auto">
                            <Suspense fallback={<DashboardSkeleton />}>
                              <Dashboard />
                            </Suspense>
                          </main>
                        </div>
                      </div>
                      <MobileMenu sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
                    </div>
                  </PrivateRoute>
                } />

                {/* Outras rotas privadas */}
                <Route path="/nova-vistoria" element={
                  <PrivateRoute>
                    <Suspense fallback={<CardSkeleton />}>
                      <NewInspection />
                    </Suspense>
                  </PrivateRoute>
                } />
                <Route path="/selecao-cliente" element={
                  <PrivateRoute>
                    <Suspense fallback={<TableSkeleton />}>
                      <ClientSelection />
                    </Suspense>
                  </PrivateRoute>
                } />
                <Route path="/informacoes-basicas" element={
                  <PrivateRoute>
                    <Suspense fallback={<CardSkeleton />}>
                      <BasicInfo />
                    </Suspense>
                  </PrivateRoute>
                } />
                <Route path="/selecao-telhas" element={
                  <PrivateRoute>
                    <Suspense fallback={<CardSkeleton />}>
                      <TileSelection />
                    </Suspense>
                  </PrivateRoute>
                } />
                <Route path="/nao-conformidades" element={
                  <PrivateRoute>
                    <Suspense fallback={<CardSkeleton />}>
                      <NonConformities />
                    </Suspense>
                  </PrivateRoute>
                } />
                <Route path="/registro-fotografico" element={
                  <PrivateRoute>
                    <Suspense fallback={<CardSkeleton />}>
                      <PhotoCapture />
                    </Suspense>
                  </PrivateRoute>
                } />
                <Route path="/revisao-finalizacao" element={
                  <PrivateRoute>
                    <Suspense fallback={<CardSkeleton />}>
                      <ReviewAndFinalize />
                    </Suspense>
                  </PrivateRoute>
                } />
                <Route path="/relatorios" element={
                  <PrivateRoute>
                    <Suspense fallback={<TableSkeleton />}>
                      <Reports />
                    </Suspense>
                  </PrivateRoute>
                } />
                <Route path="/clientes" element={
                  <PrivateRoute>
                    <Suspense fallback={<TableSkeleton />}>
                      <Clients />
                    </Suspense>
                  </PrivateRoute>
                } />
                <Route path="/calendario" element={
                  <PrivateRoute>
                    <Suspense fallback={<CardSkeleton />}>
                      <Calendar />
                    </Suspense>
                  </PrivateRoute>
                } />
              </Routes>
            </div>
          </Router>
          <SpeedInsights />
        </ToastProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;