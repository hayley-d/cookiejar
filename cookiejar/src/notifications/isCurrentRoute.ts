export function isCurrentRoute(route: string, currentPathname: string): boolean {
  const routePathname = route.split(/[?#]/)[0];
  return routePathname === currentPathname;
}
