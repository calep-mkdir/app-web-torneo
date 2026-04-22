# App Web Torneo

Aplicacion web para gestionar torneos deportivos y publicarlos en tiempo real con una zona publica y un panel de administracion.

## Estado del proyecto

Esta base queda preparada para una primera salida seria a produccion:

- `Next.js 16` con `App Router`, `React 19` y `TypeScript`.
- `Supabase` como backend operativo y canal realtime.
- build reproducible con `package-lock.json` y dependencias fijadas.
- proteccion del panel `/admin` mediante HTTP Basic Auth.
- validacion de entorno en cliente y servidor.
- control de calidad con `lint`, `typecheck`, `test` y `build`.
- `Dockerfile`, workflow de CI y documentacion de despliegue.

## Funcionalidades principales

- Alta y edicion de torneos.
- Gestion de categorias, fases, rondas, participantes y partidos.
- Registro de resultados.
- Avance automatico del bracket knockout.
- Vista publica con:
  - listado de torneos publicados,
  - detalle por torneo,
  - partidos en vivo y proximos,
  - bracket en tiempo real,
  - ficha de trayectoria por participante.

## Stack

- `next`
- `react`
- `typescript`
- `tailwindcss`
- `@supabase/supabase-js`
- `zod`
- `vitest`
- `eslint`
- `luxon`

## Requisitos

- Node.js 20 o superior
- npm 11 o superior
- un proyecto de Supabase con las migraciones aplicadas

## Variables de entorno

Duplica `.env.example` como `.env.local` en desarrollo o configura estas variables en tu plataforma de despliegue:

- `NEXT_PUBLIC_SITE_URL`
  URL publica base de la app. Se usa para metadata, `robots.txt` y `sitemap.xml`.
- `NEXT_PUBLIC_SUPABASE_URL`
  URL del proyecto Supabase.
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
  clave publica para cliente web y realtime.
- `SUPABASE_SERVICE_ROLE_KEY`
  clave privada solo para servidor. Nunca la expongas en cliente.
- `ADMIN_BASIC_AUTH_USER`
  usuario del panel `/admin`.
- `ADMIN_BASIC_AUTH_PASSWORD`
  password del panel `/admin`.

Variables opcionales para mantenimiento local con Supabase CLI:

- `SUPABASE_PROJECT_REF`
  identificador del proyecto remoto para tareas de administracion.
- `SUPABASE_DB_PASSWORD`
  password de Postgres para flujos CLI basados en `db push` o conexion directa.
- `SUPABASE_ACCESS_TOKEN`
  token personal de Supabase si quieres usar `supabase link` sin pasar `--db-url`.

## Puesta en marcha local

1. Instala dependencias:

```bash
npm install
```

2. Configura variables de entorno:

```bash
cp .env.example .env.local
```

3. Arranca la app:

```bash
npm run dev
```

4. Abre:

- zona publica: [http://localhost:3000/tournaments](http://localhost:3000/tournaments)
- admin: [http://localhost:3000/admin](http://localhost:3000/admin)

## Scripts disponibles

- `npm run dev`
  desarrollo local
- `npm run lint`
  analiza el codigo con ESLint
- `npm run typecheck`
  ejecuta TypeScript sin emitir artefactos
- `npm run test`
  ejecuta las pruebas unitarias
- `npm run build`
  compila la app para produccion
- `npm run check`
  ejecuta la cadena completa de calidad

## Base de datos

Las migraciones SQL viven en [supabase/migrations](./supabase/migrations). Incluyen:

- esquema completo de torneos, categorias, entries, fases, grupos, partidos y marcadores;
- triggers `updated_at`;
- broadcast de realtime por categoria;
- seed inicial de deportes.

El repositorio ya incluye configuracion de Supabase CLI en [supabase/config.toml](./supabase/config.toml).
Si apuntas a un proyecto o entorno nuevo, aplica las migraciones con el flujo habitual de Supabase CLI o desde tu pipeline de base de datos.

## Seguridad y produccion

- El panel `/admin` queda bloqueado con HTTP Basic Auth.
- Si en `production` faltan `ADMIN_BASIC_AUTH_USER` o `ADMIN_BASIC_AUTH_PASSWORD`, el panel responde `503` para evitar exponerlo accidentalmente.
- Las queries de lectura en App Router se marcan como dinamicas para no congelar datos durante el build.
- Se añaden cabeceras HTTP defensivas y `output: "standalone"` para despliegues mas simples.
- Se incluye `GET /api/health` para checks de plataforma o balanceador.

## Despliegue

Puedes desplegarlo de dos formas recomendadas:

- Plataforma Node/Next administrada
  Usa `npm ci` y `npm run build`, configura las variables de entorno y expone el comando `npm run start`.
- Docker
  Usa el `Dockerfile` incluido, que genera una imagen de `Next standalone`.

La guia detallada esta en [docs/deployment.md](./docs/deployment.md).

## Arquitectura y operacion

- arquitectura tecnica: [docs/architecture.md](./docs/architecture.md)
- checklist de salida: [docs/production-checklist.md](./docs/production-checklist.md)

## Limitaciones conocidas de esta primera version

- El flujo admin visible esta centrado en competidores individuales; el esquema soporta equipos, pero la interfaz aun no explota toda esa parte.
- No se ha introducido autenticacion completa por usuario/rol; para esta primera salida se endurece el acceso admin con HTTP Basic Auth.
- La consistencia multi-tabla de algunas operaciones complejas depende de varias escrituras consecutivas en Supabase, aunque se han reducido los casos de estado parcial mas obvios.
