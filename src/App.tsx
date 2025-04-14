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
                                  className="px-4 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 md:hidden"
                                  onClick={() => setSidebarOpen(true)}
                                >
                                  <span className="sr-only">Abrir menu</span>
                                  <Menu className="h-6 w-6" aria-hidden="true" />
                                </button>
                                
                                <div className="flex-1 flex justify-between">
                                  <div className="flex-1 flex">
                                    <div className="w-full flex md:ml-0">
                                      <label htmlFor="search" className="sr-only">
                                        Pesquisar
                                      </label>
                                      <div className="relative w-full text-gray-400 focus-within:text-gray-600">
                                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                          <Search className="h-5 w-5" aria-hidden="true" />
                                        </div>
                                        <input
                                          id="search"
                                          name="search"
                                          className="block w-full h-full pl-10 pr-3 py-2 border-transparent text-gray-900 placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-0 focus:border-transparent sm:text-sm"
                                          placeholder="Pesquisar"
                                          type="search"
                                        />
                                      </div>
                                    </div>
                                  </div>
                                  <div className="ml-4 flex items-center md:ml-6">
                                    <button
                                      type="button"
                                      className="p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                    >
                                      <span className="sr-only">Ver notificações</span>
                                      <Bell className="h-6 w-6" aria-hidden="true" />
                                    </button>
                                    <UserMenu />
                                  </div>
                                </div>
                              </div>
                            </div>
                          </header>
                          
                          <main>
                            <div className="py-6">
                              <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
                                <Routes>
                                  <Route index element={
                                    <Suspense fallback={<DashboardSkeleton />}>
                                      <Dashboard />
                                    </Suspense>
                                  } />
                                  <Route path="/new-inspection" element={
                                    <Suspense fallback={<CardSkeleton />}>
                                      <NewInspection />
                                    </Suspense>
                                  } />
                                  <Route path="/inspection">
                                    <Route path="client" element={
                                      <Suspense fallback={<CardSkeleton />}>
                                        <ClientSelection />
                                      </Suspense>
                                    } />
                                    <Route path="basic-info" element={
                                      <Suspense fallback={<CardSkeleton />}>
                                        <BasicInfo />
                                      </Suspense>
                                    } />
                                    <Route path="tiles" element={
                                      <Suspense fallback={<CardSkeleton />}>
                                        <TileSelection />
                                      </Suspense>
                                    } />
                                    <Route path="nonconformities" element={
                                      <Suspense fallback={<CardSkeleton />}>
                                        <NonConformities />
                                      </Suspense>
                                    } />
                                    <Route path="photos" element={
                                      <Suspense fallback={<CardSkeleton />}>
                                        <PhotoCapture />
                                      </Suspense>
                                    } />
                                    <Route path="review" element={
                                      <Suspense fallback={<CardSkeleton />}>
                                        <ReviewAndFinalize />
                                      </Suspense>
                                    } />
                                  </Route>
                                  <Route path="/reports" element={
                                    <Suspense fallback={<TableSkeleton />}>
                                      <Reports />
                                    </Suspense>
                                  } />
                                  <Route path="/clients" element={
                                    <Suspense fallback={<TableSkeleton />}>
                                      <Clients />
                                    </Suspense>
                                  } />
                                  <Route path="/calendar" element={
                                    <Suspense fallback={<CardSkeleton />}>
                                      <Calendar />
                                    </Suspense>
                                  } />
                                </Routes>
                              </div>
                            </div>
                          </main>
                        </div>
                      </div>
                    </div>
                  </PrivateRoute>
                } />
              </Routes>
            </div>
          </Router>
        </ToastProvider>
      </AuthProvider>
      <SpeedInsights />
    </ErrorBoundary>
  );
}

export default App;