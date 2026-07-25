// Utility functions

// Genera slug da titolo
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Rimuove accenti
    .replace(/[^a-z0-9]+/g, '-') // Sostituisce caratteri non alfanumerici con -
    .replace(/(^-|-$)/g, '') // Rimuove - all'inizio e alla fine
}

