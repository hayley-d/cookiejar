export type RouteDescription = {
  pathname: string;
  params: Record<string, string>;
};

export function routeToHref(route: RouteDescription): string {
  const remainingParams = { ...route.params };
  const path = route.pathname.replace(/\[([^\]]+)\]/g, (segment, parameterName: string) => {
    const value = remainingParams[parameterName];
    if (value === undefined) {
      return segment;
    }
    delete remainingParams[parameterName];
    return encodeURIComponent(value);
  });
  const query = Object.entries(remainingParams)
    .map(([name, value]) => `${encodeURIComponent(name)}=${encodeURIComponent(value)}`)
    .join('&');
  return query === '' ? path : `${path}?${query}`;
}
