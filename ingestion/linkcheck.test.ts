import assert from "node:assert/strict";
import { test } from "node:test";
import { checkUrl } from "./linkcheck.ts";

const respond = (status: number) => (async () => new Response(null, { status })) as typeof fetch;
const opts = (fetchFn: typeof fetch) => ({ userAgent: "test/0.1", fetchFn });

test("200 is ok", async () => assert.equal(await checkUrl("https://x.test", opts(respond(200))), "ok"));
test("404 and 410 are gone", async () => {
  assert.equal(await checkUrl("https://x.test", opts(respond(404))), "gone");
  assert.equal(await checkUrl("https://x.test", opts(respond(410))), "gone");
});
test("5xx and 429 are unknown, never gone", async () => {
  assert.equal(await checkUrl("https://x.test", opts(respond(503))), "unknown");
  assert.equal(await checkUrl("https://x.test", opts(respond(429))), "unknown");
});
test("network error is unknown", async () => {
  const boom = (async () => { throw new Error("ECONNRESET"); }) as typeof fetch;
  assert.equal(await checkUrl("https://x.test", opts(boom)), "unknown");
});
test("HEAD 405 falls back to GET", async () => {
  const methods: string[] = [];
  const f = (async (_u: string, init?: RequestInit) => {
    methods.push(init?.method ?? "GET");
    return new Response(null, { status: init?.method === "HEAD" ? 405 : 404 });
  }) as typeof fetch;
  assert.equal(await checkUrl("https://x.test", opts(f)), "gone");
  assert.deepEqual(methods, ["HEAD", "GET"]);
});
