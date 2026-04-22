# Checklist de salida

## Configuracion

- [ ] `NEXT_PUBLIC_SITE_URL` apunta al dominio final.
- [ ] `NEXT_PUBLIC_SUPABASE_URL` es correcta.
- [ ] `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` esta cargada.
- [ ] `SUPABASE_SERVICE_ROLE_KEY` esta cargada solo en servidor.
- [ ] `ADMIN_BASIC_AUTH_USER` y `ADMIN_BASIC_AUTH_PASSWORD` estan definidos.

## Base de datos

- [ ] migraciones aplicadas en el entorno objetivo.
- [ ] seed de deportes aplicado.
- [ ] existe al menos un torneo de prueba.
- [ ] el canal realtime por categoria funciona.

## Calidad

- [ ] `npm run lint`
- [ ] `npm run typecheck`
- [ ] `npm run test`
- [ ] `npm run build`
- [ ] `npm run check`

## Smoke test funcional

- [ ] `/tournaments` carga correctamente.
- [ ] un torneo publico aparece en el listado.
- [ ] el detalle del torneo muestra categorias.
- [ ] el bracket carga sin errores.
- [ ] `/admin` pide autenticacion.
- [ ] se puede crear un torneo desde admin.
- [ ] se puede registrar un participante.
- [ ] se puede crear un partido.
- [ ] se puede guardar un resultado.
- [ ] el cambio se refleja en la vista publica.

## Operacion

- [ ] `/api/health` responde `200`.
- [ ] logs sin errores de entorno.
- [ ] monitorizacion y alertas configuradas en la plataforma.
- [ ] copia segura de secretos y acceso restringido al panel admin.
