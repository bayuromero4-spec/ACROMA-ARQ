import { createClient } from "npm:@supabase/supabase-js@2";

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type", "Access-Control-Allow-Methods": "POST, OPTIONS" } });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return json({ ok: true });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);
  const url = Deno.env.get("SUPABASE_URL")!;
  const anon = Deno.env.get("SUPABASE_ANON_KEY")!;
  const service = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const auth = req.headers.get("Authorization") ?? "";
  if (!auth.startsWith("Bearer ")) return json({ error: "Unauthorized" }, 401);
  const userClient = createClient(url, anon, { global: { headers: { Authorization: auth } }, auth: { persistSession: false } });
  const { data: { user }, error: userError } = await userClient.auth.getUser();
  if (userError || !user) return json({ error: "Unauthorized" }, 401);
  const { data: allowed, error: permissionError } = await userClient.rpc("has_permission", { permission_code: "hub.whatsapp.manage" });
  if (permissionError || !allowed) return json({ error: "Forbidden" }, 403);

  const phoneId = Deno.env.get("WHATSAPP_PHONE_NUMBER_ID") ?? "";
  const token = Deno.env.get("WHATSAPP_ACCESS_TOKEN") ?? "";
  const version = Deno.env.get("META_GRAPH_API_VERSION") ?? "v27.0";
  if (!phoneId || !token) return json({ error: "WhatsApp Business credentials are not configured" }, 503);

  const body = await req.json();
  const to = String(body.to ?? "").replace(/[^0-9]/g, "");
  if (!/^\d{8,15}$/.test(to)) return json({ error: "Invalid recipient phone number" }, 400);
  let message: Record<string, unknown>;
  if (body.template?.name) {
    message = { messaging_product: "whatsapp", to, type: "template", template: body.template };
  } else {
    const text = String(body.text ?? "").trim();
    if (!text || text.length > 4096) return json({ error: "Message text is required (max. 4096 characters)" }, 400);
    message = { messaging_product: "whatsapp", to, type: "text", text: { preview_url: false, body: text } };
  }
  const response = await fetch(`https://graph.facebook.com/${version}/${phoneId}/messages`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify(message),
  });
  const result = await response.json();
  if (!response.ok) return json({ error: "Meta rejected the message", details: result.error?.message ?? "Unknown provider error" }, response.status >= 500 ? 502 : 400);

  const db = createClient(url, service, { auth: { persistSession: false } });
  const messageId = result.messages?.[0]?.id ?? null;
  const { data: client } = await db.from("hub_clients").select("id").eq("phone", to).maybeSingle();
  await db.from("hub_whatsapp_messages").insert({
    wa_message_id: messageId,
    client_id: client?.id ?? null,
    phone_e164: to,
    direction: "outbound",
    message_type: body.template?.name ? "template" : "text",
    body: body.template?.name ? `Plantilla: ${body.template.name}` : message.text.body,
    delivery_status: "sent",
    provider_payload: result,
    sent_at: new Date().toISOString(),
  });
  return json({ success: true, message_id: messageId });
});
