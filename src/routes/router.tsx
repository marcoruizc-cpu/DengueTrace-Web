import { Suspense } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import AppLayout from '../components/layout/AppLayout';
import { FullPageSpinner } from '../components/layout/FullPageSpinner';
import RouteErrorPage from '../pages/RouteErrorPage';
import {
  AdminAlertsPage,
  AdminDataPage,
  AdminDistrictsPage,
  AlertsPage,
  DashboardPage,
  DistrictDetailPage,
  DistrictListPage,
  LoginPage,
  MyReportsPage,
  NewReportPage,
  NotFoundPage,
  ProfilePage,
  RegisterPage,
  ReportDetailPage,
  ReportsModerationPage,
  RiskMapPage,
} from './lazyPages';
import { ProtectedRoute, PublicOnlyRoute } from './ProtectedRoute';
import { RoleRoute } from './RoleRoute';

export const router = createBrowserRouter([
  {
    errorElement: <RouteErrorPage />,
    children: [
      { path: '/login', element: <PublicOnlyRoute><LoginPage /></PublicOnlyRoute> },
      { path: '/register', element: <PublicOnlyRoute><RegisterPage /></PublicOnlyRoute> },
      {
        element: <ProtectedRoute />,
        children: [
          {
            path: '/',
            element: <AppLayout />,
            handle: { crumb: 'Inicio' },
            children: [
              { index: true, element: <Navigate to="/dashboard" replace /> },
              { path: 'dashboard', element: <DashboardPage />, handle: { crumb: 'Panel' } },
              { path: 'map', element: <RiskMapPage />, handle: { crumb: 'Mapa de riesgo' } },
              {
                path: 'districts',
                handle: { crumb: 'Distritos' },
                children: [
                  { index: true, element: <DistrictListPage /> }, // ?search=&department=&page=&size=
                  { path: ':districtId', element: <DistrictDetailPage />, handle: { crumb: 'Detalle' } }, // ?tab=
                ],
              },
              {
                path: 'reports',
                handle: { crumb: 'Reportes' },
                children: [
                  {
                    index: true,
                    element: (
                      <RoleRoute roles={['ADMIN', 'MODERATOR']}>
                        <ReportsModerationPage />
                      </RoleRoute>
                    ),
                  },
                  { path: 'new', element: <NewReportPage />, handle: { crumb: 'Nuevo reporte' } },
                  { path: 'me', element: <MyReportsPage />, handle: { crumb: 'Mis reportes' } },
                  { path: ':reportId', element: <ReportDetailPage />, handle: { crumb: 'Detalle' } },
                ],
              },
              { path: 'alerts', element: <AlertsPage />, handle: { crumb: 'Alertas' } },
              { path: 'profile', element: <ProfilePage />, handle: { crumb: 'Perfil' } },
              {
                path: 'admin',
                element: <RoleRoute roles={['ADMIN']} />,
                handle: { crumb: 'Administración' },
                children: [
                  { index: true, element: <Navigate to="districts" replace /> },
                  { path: 'districts', element: <AdminDistrictsPage />, handle: { crumb: 'Distritos' } },
                  { path: 'alerts', element: <AdminAlertsPage />, handle: { crumb: 'Alertas' } },
                  { path: 'data', element: <AdminDataPage />, handle: { crumb: 'Datos y modelo' } },
                ],
              },
            ],
          },
        ],
      },
      {
        path: '*',
        element: (
          <Suspense fallback={<FullPageSpinner />}>
            <NotFoundPage />
          </Suspense>
        ),
      },
    ],
  },
]);
