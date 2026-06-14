/**
 * TDD de segurança (SecurityStandards §1.7): o teste que verifica a REJEIÇÃO
 * vem antes da lógica de aceitação. O Discord faz checks automáticos enviando
 * assinaturas inválidas; falhar = perder o Interactions Endpoint URL.
 */

import { assertEquals } from "jsr:@std/assert@1"
import { verifyDiscordSignature } from "./verify.ts"

/** Gera um par de chaves Ed25519 e assina uma mensagem (helper de teste). */
async function makeSignedRequest(timestamp: string, body: string) {
  const keyPair = (await crypto.subtle.generateKey(
    { name: "Ed25519" },
    true,
    ["sign", "verify"],
  )) as CryptoKeyPair

  const message = new TextEncoder().encode(timestamp + body)
  const signatureBytes = new Uint8Array(
    await crypto.subtle.sign({ name: "Ed25519" }, keyPair.privateKey, message),
  )

  const rawPublicKey = new Uint8Array(
    await crypto.subtle.exportKey("raw", keyPair.publicKey),
  )

  return {
    publicKeyHex: bytesToHex(rawPublicKey),
    signatureHex: bytesToHex(signatureBytes),
  }
}

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("")
}

Deno.test("aceita uma assinatura Ed25519 válida", async () => {
  const timestamp = "1718000000"
  const body = JSON.stringify({ type: 1 })
  const { publicKeyHex, signatureHex } = await makeSignedRequest(timestamp, body)

  assertEquals(
    await verifyDiscordSignature(publicKeyHex, signatureHex, timestamp, body),
    true,
  )
})

Deno.test("rejeita assinatura adulterada", async () => {
  const timestamp = "1718000000"
  const body = JSON.stringify({ type: 1 })
  const { publicKeyHex, signatureHex } = await makeSignedRequest(timestamp, body)

  // Adultera o último caractere hex da assinatura.
  const tampered = signatureHex.slice(0, -1) +
    (signatureHex.at(-1) === "a" ? "b" : "a")

  assertEquals(
    await verifyDiscordSignature(publicKeyHex, tampered, timestamp, body),
    false,
  )
})

Deno.test("rejeita corpo adulterado (replay com payload trocado)", async () => {
  const timestamp = "1718000000"
  const body = JSON.stringify({ type: 1 })
  const { publicKeyHex, signatureHex } = await makeSignedRequest(timestamp, body)

  const tamperedBody = JSON.stringify({ type: 2, data: { name: "evil" } })

  assertEquals(
    await verifyDiscordSignature(publicKeyHex, signatureHex, timestamp, tamperedBody),
    false,
  )
})

Deno.test("rejeita (sem lançar) entradas hex malformadas — fail-closed", async () => {
  assertEquals(await verifyDiscordSignature("zz", "zz", "t", "b"), false)
  assertEquals(await verifyDiscordSignature("", "", "", ""), false)
})
