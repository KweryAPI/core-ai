/**
 * Format a tool result as a JSON string for MCP response content.
 */
export function formatResult(data: unknown): string {
  return JSON.stringify(data, null, 2);
}

/**
 * Format an error message for MCP error response content.
 */
export function formatError(err: unknown): string {
  if (err instanceof Error) return err.message;
  return String(err);
}
