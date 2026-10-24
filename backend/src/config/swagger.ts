import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { INestApplication, Logger } from "@nestjs/common";

const logger = new Logger('Swagger');

// Cómo autenticarse en /api/docs. La app usa la sesión de BetterAuth en una
// cookie (no un token Bearer): el navegador la guarda al iniciar sesión y la
// envía sola en cada "Try it out", porque Swagger está en el mismo origen.
const descripcion = `
API de Comercial 360: clientes, asesores, rutas, visitas, seguimientos, cotizaciones, pedidos y dashboard.

**Cómo probar los endpoints**

1. Inicia sesión en esta misma pestaña. Por ejemplo, desde la consola del navegador:
   \`fetch('/api/auth/sign-in/email', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: 'admin@comercial360.co', password: 'Demo2026!' }) })\`
   (usuarios de prueba del seed en el README).
2. Desde ese momento la cookie de sesión viaja sola en cada **Try it out**.

**Respuestas comunes**: 401 sin sesión · 403 sin el rol requerido (administrador, lider, asesor) · 400 datos inválidos · 404 no existe · 409 conflicto (duplicado o en uso).

El rol **asesor** solo ve sus propios datos (visitas, clientes, rutas, pedidos y dashboard).
Los endpoints de inicio y cierre de sesión los expone BetterAuth bajo \`/api/auth/*\` y no aparecen aquí.
`;

export const swaggerConfiguration = (app: INestApplication): void => {

    const config = new DocumentBuilder()
        .setTitle('Comercial 360')
        .setDescription(descripcion)
        .setVersion('1.0.0')
        // Cookie de sesión de BetterAuth.
        .addCookieAuth('better-auth.session_token', { type: 'apiKey', in: 'cookie' }, 'sesion')
        .addSecurityRequirements('sesion')
        .build()

    const document = SwaggerModule.createDocument(app, config);
    // persistAuthorization: no perder la sesión al recargar la documentación.
    SwaggerModule.setup('api/docs', app, document, { swaggerOptions: { persistAuthorization: true } })

    logger.log(`Docs available at http://localhost:${(app as any).getHttpServer()?.address()?.port ?? 3000}/api/docs`)
}
