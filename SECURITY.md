# Security Policy

## Estado actual

El repositorio puede desplegarse publicamente y la version actual deja `/admin` abierto por decision de producto.

Eso implica una recomendacion clara:

- no expongas el panel a operadores externos sin una capa adicional de autenticacion o restriccion de red;
- mantén `SUPABASE_SERVICE_ROLE_KEY` solo en entorno servidor;
- revisa regularmente las variables de entorno del hosting;
- deja `/admin` fuera de indexacion publica, como ya hace `robots.txt`.

## Como reportar un problema de seguridad

No abras issues publicos con detalles sensibles.

Reporta cualquier hallazgo directamente al propietario del repositorio y comparte:

- descripcion del problema;
- impacto;
- pasos de reproduccion;
- entorno afectado;
- mitigacion sugerida si la conoces.

## Alcance principal

Presta especial atencion a:

- exposicion accidental de `SUPABASE_SERVICE_ROLE_KEY`;
- acceso no deseado al panel `/admin`;
- validacion de entradas en server actions;
- politicas y canales realtime de Supabase;
- configuracion de secretos en la plataforma de despliegue.
