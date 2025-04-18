export function getErrorData(error: Error) {
  return {
    name: error.name,
    message: error.message,
    cause: error.cause,
    stack: error.stack,
  }
}
