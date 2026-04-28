# Checklist de salida

## Configuracion

- [ ] `NEXT_PUBLIC_SITE_URL` apunta al dominio final.
- [ ] `NEXT_PUBLIC_SUPABASE_URL` es correcta.
- [ ] `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` esta cargada.
- [ ] `SUPABASE_SERVICE_ROLE_KEY` esta cargada solo en servidor.

## Base de datos

- [ ] migraciones aplicadas en el entorno objetivo.
- [ ] seed de deportes aplicado.
- [ ] existe al menos un torneo de prueba o se ha ejecutado `npm run seed:demo`.
- [ ] el flujo de estados y resultados funciona correctamente.

## Calidad

- [ ] `npm run lint`
- [ ] `npm run typegen`
- [ ] `npm run typecheck`
- [ ] `npm run test`
- [ ] `npm run build`
- [ ] `npm run check`

## Smoke test funcional

- [ ] `/` carga correctamente.
- [ ] `/tournaments` carga correctamente.
- [ ] `/deportes` carga correctamente.
- [ ] `/organiza` carga correctamente.
- [ ] un torneo publico aparece en el listado.
- [ ] el detalle del torneo muestra categorias.
- [ ] el bracket carga sin errores.
- [ ] `/admin` abre directamente y muestra el dashboard.
- [ ] se puede crear un torneo desde admin.
- [ ] se puede registrar un participante.
- [ ] se puede crear un partido.
- [ ] se puede guardar un resultado.
- [ ] el cambio se refleja en la vista publica.

## Operacion

- [ ] `/api/health` responde `200`.
- [ ] logs sin errores de entorno.
- [ ] monitorizacion y alertas configuradas en la plataforma.
- [ ] copia segura de secretos y decision tomada sobre como proteger el panel admin en internet abierta.
- [ ] rotacion hecha de credenciales sensibles si se compartieron durante la puesta a punto.
