import { HashRouter, Navigate, Route, Routes } from 'react-router-dom';
import { ShieldDefs } from './components/Logo.jsx';
import { AppProvider } from './context/AppContext.jsx';
import { ToastProvider } from './context/ToastContext.jsx';

import Landing from './pages/auth/Landing.jsx';
import Signin from './pages/auth/Signin.jsx';
import Signup from './pages/auth/Signup.jsx';

import AppShell from './pages/owner/AppShell.jsx';
import Overview from './pages/owner/Overview.jsx';
import Applications from './pages/owner/Applications.jsx';
import ApplicationDetails from './pages/owner/ApplicationDetails.jsx';
import ScanConfiguration from './pages/owner/ScanConfiguration.jsx';
import AssessmentHistory from './pages/owner/AssessmentHistory.jsx';
import AssessmentProgress from './pages/owner/AssessmentProgress.jsx';
import Assessment from './pages/owner/Assessment.jsx';
import Findings from './pages/owner/Findings.jsx';
import FindingDetails from './pages/owner/FindingDetails.jsx';
import Remediation from './pages/owner/Remediation.jsx';
import Members from './pages/owner/Members.jsx';
import Account from './pages/owner/Account.jsx';

import AdminShell from './pages/admin/AdminShell.jsx';
import AdminOverview from './pages/admin/AdminOverview.jsx';
import UserManagement from './pages/admin/UserManagement.jsx';
import UserDetails from './pages/admin/UserDetails.jsx';
import OrganizationManagement from './pages/admin/OrganizationManagement.jsx';
import OrganizationDetails from './pages/admin/OrganizationDetails.jsx';
import ApplicationManagementAdmin from './pages/admin/ApplicationManagementAdmin.jsx';
import AuthorizationReview from './pages/admin/AuthorizationReview.jsx';
import AdminApplicationDetails from './pages/admin/AdminApplicationDetails.jsx';
import AssessmentMonitoring from './pages/admin/AssessmentMonitoring.jsx';
import SystemActivity from './pages/admin/SystemActivity.jsx';
import SystemHealth from './pages/admin/SystemHealth.jsx';

import AssessmentDetails from './pages/shared/AssessmentDetails.jsx';

export default function App() {
  return (
    <AppProvider>
      <ToastProvider>
        <ShieldDefs />
        <HashRouter>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/signin" element={<Signin />} />
            <Route path="/signup" element={<Signup />} />

            <Route path="/app" element={<AppShell />}>
              <Route index element={<Navigate to="overview" replace />} />
              <Route path="overview" element={<Overview />} />
              <Route path="applications" element={<Applications />} />
              <Route path="applications/:appId" element={<ApplicationDetails />} />
              <Route path="applications/:appId/scan" element={<ScanConfiguration />} />
              <Route path="applications/:appId/assessments" element={<AssessmentHistory />} />
              <Route path="assessments/:assessmentId" element={<AssessmentDetails />} />
              <Route path="assessments/:assessmentId/progress" element={<AssessmentProgress />} />
              <Route path="assessment" element={<Assessment />} />
              <Route path="findings" element={<Findings />} />
              <Route path="findings/:findingId" element={<FindingDetails />} />
              <Route path="remediation" element={<Remediation />} />
              <Route path="members" element={<Members />} />
              <Route path="account" element={<Account />} />
              <Route path="*" element={<Navigate to="overview" replace />} />
            </Route>

            <Route path="/admin" element={<AdminShell />}>
              <Route index element={<Navigate to="overview" replace />} />
              <Route path="overview" element={<AdminOverview />} />
              <Route path="users" element={<UserManagement />} />
              <Route path="users/:id" element={<UserDetails />} />
              <Route path="organizations" element={<OrganizationManagement />} />
              <Route path="organizations/:id" element={<OrganizationDetails />} />
              <Route path="applications" element={<ApplicationManagementAdmin />} />
              <Route path="applications/review/:appId" element={<AuthorizationReview />} />
              <Route path="applications/overview/:appId" element={<AdminApplicationDetails />} />
              <Route path="assessments" element={<AssessmentMonitoring />} />
              <Route path="assessments/:assessmentId" element={<AssessmentDetails />} />
              <Route path="activity" element={<SystemActivity />} />
              <Route path="health" element={<SystemHealth />} />
              <Route path="*" element={<Navigate to="overview" replace />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </HashRouter>
      </ToastProvider>
    </AppProvider>
  );
}
