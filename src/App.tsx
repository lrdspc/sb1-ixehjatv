import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './lib/auth.context';
import { SignIn, SignUp } from '@clerk/clerk-react';
import PrivateRoute from './components/layout/PrivateRoute';
import UserMenu from './components/layout/UserMenu';
import InstallPWA from './components/ui/InstallPWA';
import OfflineIndicator from './components/ui/OfflineIndicator';
import UpdateNotification from './components/ui/UpdateNotification';
import ClerkSupabaseIntegration from './components/ClerkSupabaseIntegration';
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

  // Initialize IndexedDB and sync service
  React.useEffect(() => {
    const initialize = async () => {
      await initDB();
      initSync();
    };
    
    initialize();
  }, []);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <ErrorBoundary>
      <ToastProvider>
        <AuthProvider>
          <ClerkSupabaseIntegration />
          <Router>
            <Routes>
              <Route path="/login" element={
                <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
                  <div className="sm:mx-auto sm:w-full sm:max-w-md">
                    <div className="flex justify-center mb-6">
                      <div className="flex items-center space-x-2">
                        <Zap className="h-8 w-8 text-blue-600" />
                        <span className="text-2xl font-bold">Brasi<span className="text-blue-600">lit</span></span>
                      </div>
                    </div>
                    <SignIn redirectUrl={window.location.href} />
                  </div>
                </div>
              } />
              <Route path="/register" element={
                <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
                  <div className="sm:mx-auto sm:w-full sm:max-w-md">
                    <div className="flex justify-center mb-6">
                      <div className="flex items-center space-x-2">
                        <Zap className="h-8 w-8 text-blue-600" />
                        <span className="text-2xl font-bold">Brasi<span className="text-blue-600">lit</span></span>
                      </div>
                    </div>
                    <SignUp redirectUrl={window.location.href} />
                  </div>
                </div>
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
              <Route path="/*" element={
                <PrivateRoute>
                  <div className="flex h-screen bg-gray-50">
                    {/* Sidebar for larger screens */}
                    <div className="hidden lg:flex">
                      <Sidebar />
                    </div>

                    {/* Mobile sidebar overlay */}
                    <div 
                      className={`fixed inset-0 z-40 lg:hidden bg-gray-600 bg-opacity-75 transition-opacity duration-300 ${
                        sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
                      }`}
                      onClick={toggleSidebar}
                    />

                    {/* Mobile sidebar drawer */}
                    <div 
                      className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 lg:hidden ${
                        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                      }`}
                    >
                      <div className="flex items-center justify-between p-4 border-b">
                        <div className="flex items-center space-x-2">
                          <Zap className="h-6 w-6 text-blue-600" />
                          <span className="text-xl font-bold">Brasi<span className="text-blue-600">lit</span></span>
                        </div>
                        <button onClick={toggleSidebar} className="p-2 rounded-md hover:bg-gray-100">
                          <X className="h-5 w-5 text-gray-500" />
                        </button>
                      </div>
                      <div className="py-4">
                        <Sidebar />
                      </div>
                    </div>

                    {/* Main content */}
                    <div className="flex-1 flex flex-col overflow-hidden">
                      {/* Top navigation */}
                      <header className="bg-white shadow-sm z-10">
                        <div className="px-4 sm:px-6 lg:px-8 py-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <button 
                                onClick={toggleSidebar} 
                                className="p-2 rounded-md text-gray-500 hover:text-gray-600 hover:bg-gray-100 lg:hidden"
                              >
                                <Menu className="h-6 w-6" />
                              </button>
                              <div className="ml-2 lg:ml-0 flex items-center space-x-2">
                                <Zap className="h-6 w-6 text-blue-600 hidden lg:block" />
                                <span className="text-xl font-bold hidden lg:block">Brasi<span className="text-blue-600">lit</span></span>
                              </div>
                            </div>
                            <div className="flex items-center space-x-4">
                              <div className="relative hidden md:block">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                  <Search className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                  type="text"
                                  placeholder="Buscar..."
                                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-gray-50 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white focus:border-blue-500 sm:text-sm"
                                />
                              </div>
                              <button className="p-2 rounded-full text-gray-500 hover:text-gray-600 hover:bg-gray-100 relative">
                                <Bell className="h-6 w-6" />
                                <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span>
                              </button>
                              <div className="flex items-center">
                                <UserMenu />
                              </div>
                            </div>
                          </div>
                        </div>
                      </header>

                      {/* Main content area */}
                      <main className="flex-1 overflow-y-auto bg-gray-50">
                        <Routes>
                          <Route path="/" element={
                            <Suspense fallback={<DashboardSkeleton />}>
                              <Dashboard />
                            </Suspense>
                          } />
                          <Route path="/nova-vistoria" element={
                            <Suspense fallback={<CardSkeleton />}>
                              <NewInspection />
                            </Suspense>
                          } />
                          <Route path="/selecao-cliente" element={
                            <Suspense fallback={<TableSkeleton />}>
                              <ClientSelection />
                            </Suspense>
                          } />
                          <Route path="/informacoes-basicas" element={
                            <Suspense fallback={<CardSkeleton />}>
                              <BasicInfo />
                            </Suspense>
                          } />
                          <Route path="/selecao-telhas" element={
                            <Suspense fallback={<CardSkeleton />}>
                              <TileSelection />
                            </Suspense>
                          } />
                          <Route path="/nao-conformidades" element={
                            <Suspense fallback={<CardSkeleton />}>
                              <NonConformities />
                            </Suspense>
                          } />
                          <Route path="/registro-fotografico" element={
                            <Suspense fallback={<CardSkeleton />}>
                              <PhotoCapture />
                            </Suspense>
                          } />
                          <Route path="/revisao-finalizacao" element={
                            <Suspense fallback={<CardSkeleton />}>
                              <ReviewAndFinalize />
                            </Suspense>
                          } />
                          <Route path="/relatorios" element={
                            <Suspense fallback={<TableSkeleton />}>
                              <Reports />
                            </Suspense>
                          } />
                          <Route path="/clientes" element={
                            <Suspense fallback={<TableSkeleton />}>
                              <Clients />
                            </Suspense>
                          } />
                          <Route path="/calendario" element={
                            <Suspense fallback={<CardSkeleton />}>
                              <Calendar />
                            </Suspense>
                          } />
                        </Routes>
                      </main>

                      {/* Mobile menu (visible on small screens) */}
                      <div className="lg:hidden">
                        <MobileMenu />
                      </div>
                    </div>
                  </div>
                  <InstallPWA />
                  <OfflineIndicator />
                  <UpdateNotification />
                </PrivateRoute>
              } />
            </Routes>
          </Router>
          <SpeedInsights />
        </AuthProvider>
      </ToastProvider>
    </ErrorBoundary>
  );
}

export default App;