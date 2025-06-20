const serviceNames = ["notifications", "auth"];

export const checkServiceName = (name: string) => {
  return serviceNames.includes(name);
};
