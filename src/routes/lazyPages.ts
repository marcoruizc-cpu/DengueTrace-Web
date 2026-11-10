import { lazy } from 'react';

export const LoginPage = lazy(() => import('../pages/auth/LoginPage'));
export const RegisterPage = lazy(() => import('../pages/auth/RegisterPage'));
export const DashboardPage = lazy(() => import('../pages/dashboard/DashboardPage'));
export const RiskMapPage = lazy(() => import('../pages/map/RiskMapPage'));
export const DistrictListPage = lazy(() => import('../pages/districts/DistrictListPage'));
export const DistrictDetailPage = lazy(() => import('../pages/districts/DistrictDetailPage'));
export const NewReportPage = lazy(() => import('../pages/reports/NewReportPage'));
export const MyReportsPage = lazy(() => import('../pages/reports/MyReportsPage'));
export const ReportDetailPage = lazy(() => import('../pages/reports/ReportDetailPage'));
export const ReportsModerationPage = lazy(() => import('../pages/reports/ReportsModerationPage'));
export const AlertsPage = lazy(() => import('../pages/alerts/AlertsPage'));
export const ProfilePage = lazy(() => import('../pages/profile/ProfilePage'));
export const AdminDistrictsPage = lazy(() => import('../pages/admin/AdminDistrictsPage'));
export const AdminAlertsPage = lazy(() => import('../pages/admin/AdminAlertsPage'));
export const AdminDataPage = lazy(() => import('../pages/admin/AdminDataPage'));
export const NotFoundPage = lazy(() => import('../pages/NotFoundPage'));
