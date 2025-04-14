export function handleError(error: unknown, context: string): string {
  if (error instanceof Error) {
    return `${context}: ${error.message}`;
  }
  return `${context}: An unknown error occurred`;
}
