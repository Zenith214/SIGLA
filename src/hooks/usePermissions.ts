/**
 * usePermissions Hook
 * React hook for checking user permissions in components
 */

import { useAuth } from '@/components/auth/AuthProvider';
import {
  canPerformWriteOperations,
  canAccessMainDashboard,
  canAccessCPAPDashboard,
  canEditCPAP,
  canSubmitCPAP,
  canAccessBackupSettings,
  canAccessAdminSettings,
  canPerformSurveyOperations,
  canManageUsers,
  canManageBarangays,
  canManageSurveyCycles,
  isViewer,
  isAdminOrDeveloper,
  getRoleDisplayName,
  getRoleDescription,
} from '@/lib/permissions';

export function usePermissions() {
  const { user } = useAuth();

  return {
    user,
    isViewer: isViewer(user),
    isAdminOrDeveloper: isAdminOrDeveloper(user),
    canWrite: canPerformWriteOperations(user),
    canAccessMainDashboard: canAccessMainDashboard(user),
    canAccessCPAPDashboard: canAccessCPAPDashboard(user),
    canEditCPAP: canEditCPAP(user),
    canSubmitCPAP: canSubmitCPAP(user),
    canAccessBackupSettings: canAccessBackupSettings(user),
    canAccessAdminSettings: canAccessAdminSettings(user),
    canPerformSurveyOperations: canPerformSurveyOperations(user),
    canManageUsers: canManageUsers(user),
    canManageBarangays: canManageBarangays(user),
    canManageSurveyCycles: canManageSurveyCycles(user),
    getRoleDisplayName: (role?: string) => getRoleDisplayName(role || user?.role || ''),
    getRoleDescription: (role?: string) => getRoleDescription(role || user?.role || ''),
  };
}
