import assert from "node:assert/strict"
import test from "node:test"

import { evaluateHubAuthorization, validateDiscordId } from "./hub-auth"

test("validateDiscordId accepts Discord snowflake strings", () => {
  assert.equal(validateDiscordId("166973299702759424"), true)
})

test("validateDiscordId rejects missing or malformed ids", () => {
  assert.equal(validateDiscordId(""), false)
  assert.equal(validateDiscordId("abc"), false)
  assert.equal(validateDiscordId("123"), false)
})

test("evaluateHubAuthorization approves the configured super admin", () => {
  assert.deepEqual(
    evaluateHubAuthorization({
      discordId: "166973299702759424",
      superAdminDiscordId: "166973299702759424",
      record: null,
    }),
    { authorized: true, phase: "alpha", reason: "super_admin" },
  )
})

test("evaluateHubAuthorization approves approved records", () => {
  assert.deepEqual(
    evaluateHubAuthorization({
      discordId: "222222222222222222",
      superAdminDiscordId: "166973299702759424",
      record: { status: "approved", phase: "beta" },
    }),
    { authorized: true, phase: "beta", reason: "allowlist" },
  )
})

test("evaluateHubAuthorization rejects pending, revoked, and missing records", () => {
  assert.deepEqual(
    evaluateHubAuthorization({
      discordId: "222222222222222222",
      superAdminDiscordId: "166973299702759424",
      record: { status: "pending", phase: "alpha" },
    }),
    { authorized: false, reason: "not_approved" },
  )
  assert.deepEqual(
    evaluateHubAuthorization({
      discordId: "222222222222222222",
      superAdminDiscordId: "166973299702759424",
      record: { status: "revoked", phase: "alpha" },
    }),
    { authorized: false, reason: "not_approved" },
  )
  assert.deepEqual(
    evaluateHubAuthorization({
      discordId: "222222222222222222",
      superAdminDiscordId: "166973299702759424",
      record: null,
    }),
    { authorized: false, reason: "not_found" },
  )
})
