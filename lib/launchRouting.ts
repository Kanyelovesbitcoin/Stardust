export const ONBOARDED_KEY = 'hasOnboarded';
export const ONBOARDING_ROUTE = '/onboarding';
export const SIGN_IN_ROUTE = '/sign-in';

export const AUTH_ROUTES = new Set([
  SIGN_IN_ROUTE,
  '/sign-up',
  '/forgot-password',
  '/reset-password',
  '/admin-sign-in',
]);

export const AUTOMATIC_PAYWALLS_ENABLED = false;

export function isAuthRoute(pathname: string): boolean {
  return AUTH_ROUTES.has(pathname);
}

export function isStableAppRoute(pathname: string): boolean {
  return pathname !== ONBOARDING_ROUTE && !isAuthRoute(pathname);
}

export function resolveLaunchRedirect({
  pathname,
  hasOnboarded,
  isAuthenticated,
}: {
  pathname: string;
  hasOnboarded: boolean | null;
  isAuthenticated: boolean;
}): string | null {
  if (hasOnboarded === null) {
    return null;
  }

  if (!hasOnboarded) {
    return pathname === ONBOARDING_ROUTE ? null : ONBOARDING_ROUTE;
  }

  if (pathname === ONBOARDING_ROUTE) {
    return isAuthenticated ? '/' : SIGN_IN_ROUTE;
  }

  if (!isAuthenticated && isStableAppRoute(pathname)) {
    return SIGN_IN_ROUTE;
  }

  if (isAuthenticated && isAuthRoute(pathname)) {
    return '/';
  }

  return null;
}

export function shouldAllowAutomaticPaywalls({
  pathname,
  hasOnboarded,
  isAuthenticated,
  automaticPaywallsEnabled = AUTOMATIC_PAYWALLS_ENABLED,
}: {
  pathname: string;
  hasOnboarded: boolean;
  isAuthenticated: boolean;
  automaticPaywallsEnabled?: boolean;
}): boolean {
  if (!automaticPaywallsEnabled) {
    return false;
  }

  return hasOnboarded && isAuthenticated && isStableAppRoute(pathname);
}

export function shouldRunPostLaunchTasks({
  pathname,
  hasOnboarded,
  isAuthenticated,
}: {
  pathname: string;
  hasOnboarded: boolean;
  isAuthenticated: boolean;
}): boolean {
  return hasOnboarded && isAuthenticated && isStableAppRoute(pathname);
}
