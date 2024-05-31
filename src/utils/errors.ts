export const getErrorMessage = (error: any): string =>
  error instanceof Error ? error.message : "Unhandled Exception";
