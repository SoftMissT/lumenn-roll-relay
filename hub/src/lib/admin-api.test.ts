import assert from "node:assert/strict"
import test from "node:test"

import {
  parseAdminCreatePayload,
  parseAdminDeletePayload,
  parseAdminUpdatePayload,
} from "./admin-api"

test("parseAdminCreatePayload accepts a valid authorized user", () => {
  assert.deepEqual(
    parseAdminCreatePayload({
      discord_id: "166973299702759424",
      username: "Nelson",
      status: "approved",
      phase: "alpha",
    }),
    {
      ok: true,
      value: {
        discord_id: "166973299702759424",
        username: "Nelson",
        status: "approved",
        phase: "alpha",
      },
    },
  )
})

test("parseAdminCreatePayload defaults optional fields", () => {
  assert.deepEqual(parseAdminCreatePayload({ discord_id: "222222222222222222" }), {
    ok: true,
    value: {
      discord_id: "222222222222222222",
      username: null,
      status: "pending",
      phase: "alpha",
    },
  })
})

test("parseAdminCreatePayload rejects invalid ids and enums", () => {
  assert.deepEqual(parseAdminCreatePayload({ discord_id: "abc" }), {
    ok: false,
    error: "discord_id inválido",
  })
  assert.deepEqual(
    parseAdminCreatePayload({
      discord_id: "222222222222222222",
      status: "owner",
    }),
    { ok: false, error: "status inválido" },
  )
})

test("parseAdminUpdatePayload accepts status and phase changes", () => {
  assert.deepEqual(
    parseAdminUpdatePayload({
      discord_id: "222222222222222222",
      status: "revoked",
      phase: "beta",
    }),
    {
      ok: true,
      value: {
        discord_id: "222222222222222222",
        status: "revoked",
        phase: "beta",
      },
    },
  )
})

test("parseAdminUpdatePayload rejects empty changes", () => {
  assert.deepEqual(parseAdminUpdatePayload({ discord_id: "222222222222222222" }), {
    ok: false,
    error: "nenhuma alteração informada",
  })
})

test("parseAdminDeletePayload accepts only valid Discord IDs", () => {
  assert.deepEqual(parseAdminDeletePayload({ discord_id: "222222222222222222" }), {
    ok: true,
    value: { discord_id: "222222222222222222" },
  })
  assert.deepEqual(parseAdminDeletePayload({ discord_id: "bad" }), {
    ok: false,
    error: "discord_id inválido",
  })
})
