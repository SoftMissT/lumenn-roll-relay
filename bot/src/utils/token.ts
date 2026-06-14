/**
 * Charset sem ambiguidade visual (sem 0/O/l/1/I).
 * 32 caracteres → 24 chars → ~120 bits de entropia.
 */
const CHARSET = "abcdefghjkmnpqrstuvwxyz23456789"
const TOKEN_LENGTH = 24

/** Gera world_token seguro via Web Crypto nativo. */
export function generateWorldToken(): string {
  const bytes = new Uint8Array(TOKEN_LENGTH)
  crypto.getRandomValues(bytes)
  return Array.from(bytes, (b) => CHARSET[b % CHARSET.length]).join("")
}
