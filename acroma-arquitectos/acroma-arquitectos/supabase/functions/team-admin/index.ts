import { createClient } from "npm:@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
const APP_SITE_URL = Deno.env.get("APP_SITE_URL") ?? "https://acroma-arq.pages.dev";

const corsHeaders = {
  "Access-Control-Allow-Origin": APP_SITE_URL,
  "Access-Control-Allow-Headers": "authorization, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Vary": "Origin",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (!["GET", "POST"].includes(req.method)) return json({ error: "Método no permitido." }, 405);

  const authorization = req.headers.get("Authorization") ?? "";
  const token = authorization.replace(/^Bearer\s+/i, "");
  if (!token) return json({ error: "Sesión requerida." }, 401);

  const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const callerClient = createClient(SUPABASE_URL, ANON_KEY, {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data: authData, error: authError } = await admin.auth.getUser(token);
  if (authError || !authData.user) return json({ error: "Sesión no válida." }, 401);

  const { data: allowed, error: permissionError } = await callerClient.rpc("has_permission", {
    permission_code: "users.manage",
  });
  if (permissionError || allowed !== true) return json({ error: "No tienes permiso para gestionar usuarios." }, 403);

  if (req.method === "GET") {
    const [{ data: roles, error: rolesError }, { data: assignments, error: assignmentsError }, { data: usersData, error: usersError }] =
      await Promise.all([
        admin.from("roles").select("id,code,name").order("name"),
        admin.from("user_roles").select("user_id,role_id,assigned_at,roles(code,name)"),
        admin.auth.admin.listUsers({ page: 1, perPage: 500 }),
      ]);

    if (rolesError || assignmentsError || usersError) {
      return json({ error: rolesError?.message ?? assignmentsError?.message ?? usersError?.message }, 500);
    }

    const userMap = new Map((usersData.users ?? []).map((u) => [u.id, u]));
    const result = (assignments ?? []).map((assignment) => {
      const user = userMap.get(assignment.user_id);
      const role = Array.isArray(assignment.roles) ? assignment.roles[0] : assignment.roles;
      return {
        id: assignment.user_id,
        email: user?.email ?? "Usuario sin correo disponible",
        confirmed: Boolean(user?.email_confirmed_at),
        role_code: role?.code ?? "",
        role_name: role?.name ?? "Sin rol",
        assigned_at: assignment.assigned_at,
      };
    });
    return json({ users: result, roles: (roles ?? []).filter((r) => r.code !== "admin") });
  }

  let body: { email?: string; role_code?: string };
  try { body = await req.json(); } catch { return json({ error: "El cuerpo JSON no es válido." }, 400); }
  const email = String(body.email ?? "").trim().toLowerCase();
  const roleCode = String(body.role_code ?? "");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return json({ error: "Introduce un correo válido." }, 400);
  if (!["editor", "commercial"].includes(roleCode)) return json({ error: "Rol no permitido. El administrador principal no se asigna desde este formulario." }, 400);

  const { data: protectedAdmin } = await admin.from("admins").select("email").eq("email", email).maybeSingle();
  if (protectedAdmin) return json({ error: "Ese correo está reservado para un administrador principal." }, 409);

  const { data: role, error: roleError } = await admin.from("roles").select("id,code,name").eq("code", roleCode).single();
  if (roleError || !role) return json({ error: "El rol solicitado no está configurado." }, 400);

  const { data: listed, error: listError } = await admin.auth.admin.listUsers({ page: 1, perPage: 500 });
  if (listError) return json({ error: listError.message }, 500);
  let user = listed.users.find((item) => item.email?.toLowerCase() === email);

  if (!user) {
    const { data: invited, error: inviteError } = await admin.auth.admin.inviteUserByEmail(email, {
      redirectTo: `${APP_SITE_URL}/admin`,
    });
    if (inviteError || !invited.user) return json({ error: inviteError?.message ?? "No se pudo enviar la invitación." }, 400);
    user = invited.user;
  }

  const { error: assignError } = await admin.from("user_roles").upsert({
    user_id: user.id,
    role_id: role.id,
    assigned_by: authData.user.id,
  }, { onConflict: "user_id,role_id" });
  if (assignError) return json({ error: assignError.message }, 500);

  return json({
    ok: true,
    message: user.email_confirmed_at ? "Rol asignado correctamente." : "Invitación enviada y rol asignado.",
    user: { id: user.id, email: user.email, role: role.name },
  }, 201);
});
