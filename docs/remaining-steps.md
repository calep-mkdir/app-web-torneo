# Pasos que faltan fuera de Codex

Estos son los pasos que no se pueden completar automaticamente desde este entorno porque dependen de tus credenciales o de decisiones de cuenta.

## 1. Crear o elegir el proyecto de Supabase

Necesitas un proyecto real de Supabase donde desplegar la base de datos del torneo.

Cuando lo tengas, guarda estos tres valores:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

## 2. Aplicar migraciones en Supabase

Las migraciones estan en [supabase/migrations](../supabase/migrations).

Tienes dos caminos:

- con Supabase CLI:
  - conecta tu proyecto
  - ejecuta `supabase db push`
- con el panel de Supabase:
  - abre SQL Editor
  - ejecuta los archivos en orden

## 3. Elegir plataforma de despliegue

La opcion mas facil suele ser `Vercel`.

Alternativas compatibles:

- Railway
- Render
- Fly.io
- cualquier runtime Node con `npm run build` y `npm run start`
- Docker usando el [Dockerfile](../Dockerfile)

## 4. Conectar el repo privado a tu hosting

Importa [calep-mkdir/app-web-torneo](https://github.com/calep-mkdir/app-web-torneo) desde la plataforma elegida.

Si el proveedor te pide permisos para leer repos privados, concédeselos a GitHub.

## 5. Configurar variables de entorno en produccion

Copia los nombres desde [.env.example](../.env.example):

- `NEXT_PUBLIC_SITE_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `ADMIN_BASIC_AUTH_USER`
- `ADMIN_BASIC_AUTH_PASSWORD`

## 6. Lanzar el primer deploy

Una vez cargados los secretos:

- ejecuta el deploy inicial en la plataforma
- confirma que el build termina correctamente

## 7. Ejecutar smoke test post-deploy

Comprueba al menos:

- `GET /api/health` devuelve `200`
- `/tournaments` carga
- `/admin` pide credenciales
- puedes crear un torneo
- puedes crear participantes y partidos
- el realtime se refleja en la parte publica

## 8. Opcional pero recomendado: activar GitHub Pro o un plan con branch protection para privados

El repo ya esta privado y con ajustes razonables, pero la proteccion de rama de `main` no se puede activar desde la API con el plan actual.

Si mas adelante activas un plan compatible, entonces haz esto:

- proteger `main`
- bloquear force-push
- bloquear borrado de rama
- requerir PR para merge
- exigir que pase la CI

## 9. Opcional: añadir observabilidad

Lo minimo:

- logs centralizados
- alerta si falla `/api/health`
- captura de errores de servidor
- monitorizacion de tiempo de respuesta
