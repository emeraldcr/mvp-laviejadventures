import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import ts from "typescript";

function setup() {
  const module = { exports: {} };
  const window = {};
  const code = ts.transpileModule(fs.readFileSync("lib/analytics/google.ts", "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  vm.runInNewContext(code, { module, exports: module.exports, window });
  return { window, ...module.exports };
}

test("booking events queue only allowlisted, non-personal parameters", () => {
  const { window, sendBookingGoogleEvent } = setup();
  sendBookingGoogleEvent("booking_step_blocked", { step: 2, targetStep: 3, email: "guest@example.com", booking: { name: "Guest" }, source: "guest@example.com" });
  const [command, event, params] = window.dataLayer[0];
  assert.equal(command, "event");
  assert.equal(event, "booking_step_blocked");
  assert.equal(JSON.stringify(params), JSON.stringify({ step: 2, target_step: 3 }));
  sendBookingGoogleEvent("click", { email: "guest@example.com" });
  assert.equal(window.dataLayer.length, 1);
});

test("Google failures do not interrupt the reservation", () => {
  const { window, sendBookingGoogleEvent } = setup();
  window.gtag = () => { throw new Error("blocked"); };
  assert.doesNotThrow(() => sendBookingGoogleEvent("payment_error", { stage: "capture", reason: "private details" }));
});
