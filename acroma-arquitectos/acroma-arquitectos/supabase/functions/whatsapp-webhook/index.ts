import { createClient } from "npm:@supabase/supabase-js@2";

const cors = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-hub-signature-256", "Access-Control-Allow-Methods": "GET, POST, OPTIONS" };
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { ...cors, "Content-Type": "application/json" } });

async function validSignature(raw: string, signature: string | null, secret: string) {
  if (!signature?.startsWith("sha256=")) return false;
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const digest = new Uint8Array(await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(raw)));
  const hex = [...digest].map((b) => b.toString(16).padStart(2, "0")).join("");
  const expected = signature.slice(7);
  if (hex.length !== expected.length) return false;
  let diff = 0;
  for (let i = 0; i < hex.length; i++) diff |= hex.charCodeAt(i) ^ expected.charCodeAt(i);
  return diff === 0;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  const verifyToken = Deno.env.get("META_WEBHOOK_VERIFY_TOKEN") ?? "";
  if (req.method === "GET") {
    const u = new URL(req.url);
    const mode = u.searchParams.get("hub.mode");
    const token = u.searchParams.get("hub.verify_token");
    const challenge = u.searchParams.get("hub.challenge");
    if (mode === "subscribe" && verifyToken && token === verifyToken && challenge) return new Response(challenge, { status: 200, headers: cors });
    return new Response("Forbidden", { status: 403, headers: cors });
  }
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const appSecret = Deno.env.get("META_APP_SECRET") ?? "";
  const raw = await req.text();
  if (!appSecret || !(await validSignature(raw, req.headers.get("x-hub-signature-256"), appSecret))) return json({ error: "Invalid webhook signature" }, 401);

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const db = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });
  const payload = JSON.parse(raw);
  const writes: Record<string, unknown>[] = [];

  for (const entry of payload.entry ?? []) {
    for (const change of entry.changes ?? []) {
      const value = change.value ?? {};
      for (const message of value.messages ?? []) {
        const phone = String(message.from ?? "");
        const text = message.text?.body ?? message.button?.text ?? message.interactive?.button_reply?.title ?? message.interactive?.list_reply?.title ?? "";
        const { data: client } = await db.from("hub_clients").select("id").eq("phone", phone).maybeSingle();
        writes.push({
          wa_message_id: message.id ?? null,
          client_id: client?.id ?? null,
          phone_e164: phone,
          direction: "inbound",
          message_type: message.type ?? "unknown",
          body: String(text).slice(0, 4000),
          delivery_status: "received",
          provider_payload: message,
        });
      }
      for (const status of value.statuses ?? []) {
        await db.from("hub_whatsapp_messages").update({ delivery_status: status.status }).eq("wa_message_id", status.id);
      }
    }
  }
  if (writes.length) {
    const { error } = await db.from("hub_whatsapp_messages").upsert(writes, { onConflict: "wa_message_id", ignoreDuplicates: true });
    if (error) return json({ error: "Could not store webhook messages" }, 500);
  }
  return new Response("EVENT_RECEIVED", { status: 200, headers: cors });
});
