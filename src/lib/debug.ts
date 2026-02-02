/**
 * Debug logging utility that only logs in development mode
 */
export const debugLog = (...args: unknown[]) => {
  if (import.meta.env.DEV) {
    console.log(...args)
  }
}

export const debugWarn = (...args: unknown[]) => {
  if (import.meta.env.DEV) {
    console.warn(...args)
  }
}

export const debugError = (...args: unknown[]) => {
  if (import.meta.env.DEV) {
    console.error(...args)
  }
}
