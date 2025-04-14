import React from 'react';
import { RouteObject } from 'react-router-dom';
import PrivateRoute from '../components/layout/PrivateRoute';

// Lazy loaded pages
const Login = React.lazy(() => import('../pages/auth/Login'));
const Register = React.lazy(() => import('../pages/auth/Register'));
const ForgotPassword = React.lazy(() => import('../pages/auth/ForgotPassword'));
const ResetPassword = React.lazy(() => import('../pages/auth/ResetPassword'));
const Dashboard = React.lazy(() => import('../pages/Dashboard'));
const NewInspection = React.lazy(() => import('../pages/NewInspection'));
const ClientSelection = React.lazy(() => import('../pages/inspection/ClientSelection'));
const BasicInfo = React.lazy(() => import('../pages/inspection/BasicInfo'));
const TileSelection = React.lazy(() => import('../pages/inspection/TileSelection'));
const NonConformities = React.lazy(() => import('../pages/inspection/NonConformities'));
const PhotoCapture = React.lazy(() => import('../pages/inspection/PhotoCapture'));
const ReviewAndFinalize = React.lazy(() => import('../pages/inspection/ReviewAndFinalize'));
const Reports = React.lazy(() => import('../pages/Reports'));
const Clients = React.lazy(() => import('../pages/Clients'));
const Calendar = React.lazy(() => import('../pages/Calendar'));

// Imports para os skeletons
import DashboardSkeleton from '../components/skeletons/DashboardSkeleton';
import CardSkeleton from '../components/skeletons/CardSkeleton';
import TableSkeleton from '../components/skeletons/TableSkeleton';

// Criar um wrapper para rotas privadas
const PrivateWrapper = ({ children }: { children: React.ReactNode }) => (
  <PrivateRoute>
    {children}
  </PrivateRoute>
);

// Definir as rotas públicas
const publicRoutes: RouteObject[] = [
  {
    path: '/login',
    element: (
      <React.Suspense fallback={<CardSkeleton />}>
        <Login />
      </React.Suspense>
    )
  },
  {
    path: '/register',
    element: (
      <React.Suspense fallback={<CardSkeleton />}>
        <Register />
      </React.Suspense>
    )
  },
  {
    path: '/forgot-password',
    element: (
      <React.Suspense fallback={<CardSkeleton />}>
        <ForgotPassword />
      </React.Suspense>
    )
  },
  {
    path: '/reset-password',
    element: (
      <React.Suspense fallback={<CardSkeleton />}>
        <ResetPassword />
      </React.Suspense>
    )
  }
];

// Definir as rotas privadas
const privateRoutes: RouteObject[] = [
  {
    path: '/',
    element: (
      <React.Suspense fallback={<DashboardSkeleton />}>
        <Dashboard />
      </React.Suspense>
    )
  },
  {
    path: '/nova-vistoria',
    element: (
      <React.Suspense fallback={<CardSkeleton />}>
        <NewInspection />
      </React.Suspense>
    )
  },
  {
    path: '/selecao-cliente',
    element: (
      <React.Suspense fallback={<TableSkeleton />}>
        <ClientSelection />
      </React.Suspense>
    )
  },
  {
    path: '/informacoes-basicas',
    element: (
      <React.Suspense fallback={<CardSkeleton />}>
        <BasicInfo />
      </React.Suspense>
    )
  },
  {
    path: '/selecao-telhas',
    element: (
      <React.Suspense fallback={<CardSkeleton />}>
        <TileSelection />
      </React.Suspense>
    )
  },
  {
    path: '/nao-conformidades',
    element: (
      <React.Suspense fallback={<CardSkeleton />}>
        <NonConformities />
      </React.Suspense>
    )
  },
  {
    path: '/registro-fotografico',
    element: (
      <React.Suspense fallback={<CardSkeleton />}>
        <PhotoCapture />
      </React.Suspense>
    )
  },
  {
    path: '/revisao-finalizacao',
    element: (
      <React.Suspense fallback={<CardSkeleton />}>
        <ReviewAndFinalize />
      </React.Suspense>
    )
  },
  {
    path: '/relatorios',
    element: (
      <React.Suspense fallback={<TableSkeleton />}>
        <Reports />
      </React.Suspense>
    )
  },
  {
    path: '/clientes',
    element: (
      <React.Suspense fallback={<TableSkeleton />}>
        <Clients />
      </React.Suspense>
    )
  },
  {
    path: '/calendario',
    element: (
      <React.Suspense fallback={<CardSkeleton />}>
        <Calendar />
      </React.Suspense>
    )
  }
];

// Combinar todas as rotas
export const routes: RouteObject[] = [
  ...publicRoutes,
  {
    path: '*',
    element: <PrivateWrapper>
      <AppLayout>
        <PrivateRoutesOutlet />
      </AppLayout>
    </PrivateWrapper>
  }
];

// Componente para o layout principal da aplicação
function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Layout principal da aplicação vai aqui */}
      {children}
    </div>
  );
}

// Outlet para as rotas privadas
function PrivateRoutesOutlet() {
  return (
    <React.Suspense fallback={<DashboardSkeleton />}>
      {/* Aqui entraria um componente de Outlet para as rotas privadas */}
      <div className="flex-1 overflow-y-auto">
        {/* Seria substituído por <Outlet /> */}
      </div>
    </React.Suspense>
  );
}

export const navItems = [
  { path: '/', label: 'Dashboard', icon: 'Home' },
  { path: '/nova-vistoria', label: 'Nova Vistoria', icon: 'Plus' },
  { path: '/relatorios', label: 'Relatórios', icon: 'FileText' },
  { path: '/clientes', label: 'Clientes', icon: 'Users' },
  { path: '/calendario', label: 'Calendário', icon: 'Calendar' },
]; 