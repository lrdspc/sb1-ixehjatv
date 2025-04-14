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

// Rotas públicas
export const publicRoutes: RouteObject[] = [
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/register',
    element: <Register />,
  },
  {
    path: '/forgot-password',
    element: <ForgotPassword />,
  },
  {
    path: '/reset-password',
    element: <ResetPassword />,
  },
];

// Rotas privadas (requerem autenticação)
export const privateRoutes: RouteObject[] = [
  {
    path: '/',
    element: <PrivateWrapper><Dashboard /></PrivateWrapper>,
  },
  {
    path: '/dashboard',
    element: <PrivateWrapper><Dashboard /></PrivateWrapper>,
  },
  {
    path: '/new-inspection',
    element: <PrivateWrapper><NewInspection /></PrivateWrapper>,
  },
  {
    path: '/inspection/client',
    element: <PrivateWrapper><ClientSelection /></PrivateWrapper>,
  },
  {
    path: '/inspection/basic-info',
    element: <PrivateWrapper><BasicInfo /></PrivateWrapper>,
  },
  {
    path: '/inspection/tiles',
    element: <PrivateWrapper><TileSelection /></PrivateWrapper>,
  },
  {
    path: '/inspection/nonconformities',
    element: <PrivateWrapper><NonConformities /></PrivateWrapper>,
  },
  {
    path: '/inspection/photos',
    element: <PrivateWrapper><PhotoCapture /></PrivateWrapper>,
  },
  {
    path: '/inspection/review',
    element: <PrivateWrapper><ReviewAndFinalize /></PrivateWrapper>,
  },
  {
    path: '/reports',
    element: <PrivateWrapper><Reports /></PrivateWrapper>,
  },
  {
    path: '/clients',
    element: <PrivateWrapper><Clients /></PrivateWrapper>,
  },
  {
    path: '/calendar',
    element: <PrivateWrapper><Calendar /></PrivateWrapper>,
  },
];