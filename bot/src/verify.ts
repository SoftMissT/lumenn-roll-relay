/**
 * Verificação de assinatura Ed25519 das requisições do Discord.
 *
 * O Discord assina cada interação HTTP com Ed25519. Cada request traz os headers
 * `X-Signature-Ed25519` (assinatura, hex) e `X-Signature-Timestamp`. A mensagem
 * assinada é `timestamp + corpo cru da requisição`. Verificamos com a public key
 * da aplicação (Developer Portal → General Information).
 *
 * Usa Web Crypto nativo do Deno (Ed25519) — sem dependências externas.
 *
 * Referência: https://discord.com/developers/docs/interactions/overview
 * (verificado via context7, 2026-06-14).
 */

/** Converte string hex em Uint8Array<ArrayBuffer>. Lança se o hex for inválido. */
function hexToBytes(hex: string): Uint8Array<ArrayBuffer> {
  if (hex.length % 2 !== 0) {
    throw new Error("hex de comprimento ímpar")
  }
  const buf = new ArrayBuffer(hex.length / 2)
  const bytes = new Uint8Array(buf)
  for (let i = 0; i < bytes.length; i++) {
    const byte = Number.parseInt(hex.slice(i * 2, i * 2 + 2), 16)
    if (Number.isNaN(byte)) {
      throw new Error("caractere hex inválido")
    }
    bytes[i] = byte
  }
  return bytes as Uint8Array<ArrayBuffer>
}

/**
 * Verifica a assinatura de uma interação do Discord.
 *
 * Retorna `false` (fail-closed) para qualquer entrada malformada — hex inválido,
 * chave inválida, etc. — em vez de lançar, para que o handler sempre responda 401.
 */
export async function verifyDiscordSignature(
  publicKeyHex: string,
  signatureHex: string,
  timestamp: string,
  rawBody: string,
): Promise<boolean> {
  try {
    const key = await crypto.subtle.importKey(
      "raw",
      hexToBytes(publicKeyHex),
      { name: "Ed25519" },
      false,
      ["verify"],
    )

    const message = new TextEncoder().encode(timestamp + rawBody)

    return await crypto.subtle.verify(
      { name: "Ed25519" },
      key,
      hexToBytes(signatureHex),
      message,
    )
  } catch {
    return false
  }
}
