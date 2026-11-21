# Configuración de ACROMA Business Hub

## Ruta y base de datos
- Aplicación: `/admin/hub`
- Proyecto Supabase: ACROMA (`qfrfqnjvsdujumyimzap`)
- Migración: `business-hub-v1.sql`
- Moneda: PEN (S/)
- Los datos del Hub son privados y las tablas nuevas tienen RLS y permisos por módulo.

## WhatsApp Business Platform

Las Edge Functions `whatsapp-webhook` y `whatsapp-send` están desplegadas. Para activarlas, configura estos secretos en Supabase Dashboard → Project Settings → Edge Functions → Secrets:

- `META_APP_SECRET`: App Secret de la aplicación de Meta.
- `META_WEBHOOK_VERIFY_TOKEN`: cadena aleatoria privada elegida por ACROMA.
- `WHATSAPP_PHONE_NUMBER_ID`: ID del número de teléfono registrado en WhatsApp Cloud API.
- `WHATSAPP_ACCESS_TOKEN`: token de acceso de larga duración/system user.
- `META_GRAPH_API_VERSION`: versión de Graph API aprobada para la app (por ejemplo `v27.0`).

No introduzcas estos valores en el navegador, en archivos `.env` públicos, en GitHub ni en el panel de ACROMA.

### Webhook de Meta

Configura la URL de callback:
`https://qfrfqnjvsdujumyimzap.supabase.co/functions/v1/whatsapp-webhook`

- Verify token: el mismo valor de `META_WEBHOOK_VERIFY_TOKEN`.
- Suscripción de WhatsApp: campo `messages`.
- Meta firma las notificaciones POST; el webhook valida `X-Hub-Signature-256` con `META_APP_SECRET`.
- Los mensajes recibidos se guardan en `hub_whatsapp_messages`; los estados de entrega actualizan el registro correspondiente.

### Envío desde el Hub

El frontend llama a `whatsapp-send` con la sesión autenticada. La función comprueba `hub.whatsapp.manage`, llama a Graph API y registra el mensaje saliente. Para mensajes libres debe respetarse la ventana de atención de WhatsApp; fuera de ella se deben usar plantillas aprobadas.

### Prueba antes de producción

1. Completar los secretos.
2. Configurar y verificar el webhook en Meta for Developers.
3. Enviar un mensaje entrante desde un número de prueba.
4. Confirmar que aparece en la bandeja del Hub.
5. Probar una respuesta dentro de la ventana permitida.
6. Verificar estados `sent`, `delivered` y `read`.

## Roles

- Administrador: control completo.
- Comercial: clientes, oportunidades, cotizaciones y conversaciones.
- Editor: proyectos, tareas y lectura de clientes.
- Los permisos se verifican en RLS; ocultar botones no sustituye la seguridad de base de datos.

## Alcance actual de la interfaz

El Hub incluye vistas funcionales para dashboard, CRM, oportunidades, cotizaciones, contratos, proyectos, tareas, agenda, finanzas, marketing, reportes y bandeja de WhatsApp. El gestor CMS y la administración de usuarios siguen disponibles en `/admin`.

La integración de WhatsApp depende de los secretos y la verificación en Meta. Las plantillas PDF, firma digital, sincronización de calendario y reportes exportables requieren iteraciones adicionales.
