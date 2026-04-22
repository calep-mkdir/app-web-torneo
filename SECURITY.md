# Security Policy

## Estado actual

El repositorio se mantiene privado y el panel `/admin` queda protegido por HTTP Basic Auth en produccion.

## Como reportar un problema de seguridad

No abras issues publicos con detalles sensibles.

Mientras el repositorio siga privado, reporta cualquier hallazgo directamente al propietario del repositorio y comparte:

- descripcion del problema;
- impacto;
- pasos de reproduccion;
- entorno afectado;
- mitigacion sugerida si la conoces.

## Alcance principal

Presta especial atencion a:

- exposicion accidental de `SUPABASE_SERVICE_ROLE_KEY`;
- proteccion del panel `/admin`;
- validacion de entradas en server actions;
- politicas y canales realtime de Supabase;
- configuracion de secretos en la plataforma de despliegue.
