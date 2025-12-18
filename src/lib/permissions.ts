/**
 * Permission Utility
 * Centralized permission checking for role-based access control
 */

export type UserRole = 'admin' | 'developer' | 'officer' | 'viewer' | 'fs' | 'interviewer';

export interface PermissionUser {
  role: string;
  id?: string | number;
}

/**
 * Check if user has a specific role
 */
export function hasRole(user: PermissionUser | null, role: UserRole): boolean {
  if (!user) return false;
  return user.role.toLowerCase() === role.toLowerCase();
}

/**
 * Check if user has any of the specified roles
 */
export function hasAnyRole(user: PermissionUser | null, roles: UserRole[]): boolean {
  if (!user) return false;
  const userRole = user.role.toLowerCase();
  return roles.some(role => role.toLowerCase() === userRole);
}

/**
 * Check if user is an admin or developer (full access)
 */
export function isAdminOrDeveloper(user: PermissionUser | null): boolean {
  return hasAnyRole(user, ['admin', 'developer']);
}

/**
 * Check if user is a viewer (read-only access)
 */
export function isViewer(user: PermissionUser | null): boolean {
  return hasRole(user, 'viewer');
}

/**
 * Check if user can perform write operations (create, update, delete)
 * Viewers cannot perform any write operations
 */
export function canPerformWriteOperations(user: PermissionUser | null): boolean {
  if (!user) return false;
  return !isViewer(user);
}

/**
 * Check if user can access the main dashboard (map and analytics tabs)
 * All authenticated users can access the main dashboard
 */
export function canAccessMainDashboard(user: PermissionUser | null): boolean {
  return !!user;
}

/**
 * Check if user can access CPAP management dashboard
 * Admin, Developer, Officer, and Viewer can access (Viewer is read-only)
 */
export function canAccessCPAPDashboard(user: PermissionUser | null): boolean {
  if (!user) return false;
  return hasAnyRole(user, ['admin', 'developer', 'officer', 'viewer']);
}

/**
 * Check if user can edit CPAP items
 * Only Admin, Developer, and Officer can edit
 */
export function canEditCPAP(user: PermissionUser | null): boolean {
  if (!user) return false;
  return hasAnyRole(user, ['admin', 'developer', 'officer']);
}

/**
 * Check if user can submit CPAP
 * Only Admin, Developer, and Officer can submit
 */
export function canSubmitCPAP(user: PermissionUser | null): boolean {
  if (!user) return false;
  return hasAnyRole(user, ['admin', 'developer', 'officer']);
}

/**
 * Check if user can access backup settings
 * All authenticated users can access backup settings
 */
export function canAccessBackupSettings(user: PermissionUser | null): boolean {
  return !!user;
}

/**
 * Check if user can access admin settings (excluding backup)
 * Only Admin and Developer can access
 */
export function canAccessAdminSettings(user: PermissionUser | null): boolean {
  return isAdminOrDeveloper(user);
}

/**
 * Check if user can perform survey operations
 * Viewer cannot perform survey operations
 */
export function canPerformSurveyOperations(user: PermissionUser | null): boolean {
  if (!user) return false;
  return !isViewer(user);
}

/**
 * Check if user can manage users
 * Only Admin and Developer can manage users
 */
export function canManageUsers(user: PermissionUser | null): boolean {
  return isAdminOrDeveloper(user);
}

/**
 * Check if user can manage barangays
 * Only Admin and Developer can manage barangays
 */
export function canManageBarangays(user: PermissionUser | null): boolean {
  return isAdminOrDeveloper(user);
}

/**
 * Check if user can manage survey cycles
 * Only Admin and Developer can manage survey cycles
 */
export function canManageSurveyCycles(user: PermissionUser | null): boolean {
  return isAdminOrDeveloper(user);
}

/**
 * Get user-friendly role display name
 */
export function getRoleDisplayName(role: string): string {
  const roleMap: Record<string, string> = {
    admin: 'Administrator',
    developer: 'Developer',
    officer: 'Officer',
    viewer: 'Viewer',
    fs: 'Field Supervisor',
    interviewer: 'Interviewer',
  };
  return roleMap[role.toLowerCase()] || role;
}

/**
 * Get role description
 */
export function getRoleDescription(role: string): string {
  const descriptionMap: Record<string, string> = {
    admin: 'Full system access with all permissions',
    developer: 'Full system access for development purposes',
    officer: 'Can manage CPAP and perform data operations',
    viewer: 'Read-only access to dashboards and data',
    fs: 'Field Supervisor - manages survey assignments',
    interviewer: 'Conducts surveys and collects data',
  };
  return descriptionMap[role.toLowerCase()] || 'No description available';
}
