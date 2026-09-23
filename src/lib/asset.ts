// Resolve a file in public/ against the deploy base (see vite.config.ts).
export const asset = (path: string) => `${import.meta.env.BASE_URL}${path.replace(/^\//, '')}`
