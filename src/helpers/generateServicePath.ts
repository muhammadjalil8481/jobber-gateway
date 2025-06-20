export const generateServicePath = (path: string) => {
  return new RegExp(`^/api/v[0-9]+/${path}`);
};