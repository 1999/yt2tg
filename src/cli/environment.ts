export const checkEnvironmentVariableSet = (...envKeys: string[]): string[] => {
  return envKeys.map((key) => {
    if (!process.env[key]) {
      throw new Error(`${key} env is not set`);
    }

    return process.env[key]!;
  });
};
