# Padel Tournaments

Aplicacion web para gestionar torneos de padel con una experiencia multipagina, oscura, visual y centrada en cuadros, partidos, parejas y resultados.

## Estado del proyecto

Esta base queda preparada para una primera salida seria a produccion:

- `Next.js 16` con `App Router`, `React 19` y `TypeScript`.
- `Supabase` como backend operativo.
- build reproducible con `package-lock.json` y dependencias fijadas.
- experiencia publica multipagina centrada en padel, con portada tipo portal de torneo, listado, detalle y flujo de organizacion.
- panel `/admin` abierto para operar sin login y con alta simplificada de torneos.
- validacion de entorno en cliente y servidor.
- control de calidad con `lint`, `typegen`, `typecheck`, `test` y `build`.
- `Dockerfile`, workflow de CI y documentacion de despliegue.
- script reutilizable para resetear y sembrar un torneo demo completo.

## Funcionalidades principales

- Alta y edicion de torneos de padel.
- Gestion de categorias, fases, rondas, parejas, participantes y partidos.
- Registro de resultados.
- Avance automatico del bracket knockout.
- Vista publica con:
  - home principal estilo portal de torneo,
  - listado de torneos publicados,
  - vista de circuito de padel,
  - pagina de organizacion,
  - detalle por torneo,
  - resultados y partidos pendientes,
  - bracket completo,
  - ficha de trayectoria por pareja o entrada.

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

- Node.js 22 o superior
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

- home: [http://localhost:3000](http://localhost:3000)
- zona publica: [http://localhost:3000/tournaments](http://localhost:3000/tournaments)
- deportes: [http://localhost:3000/deportes](http://localhost:3000/deportes)
- organiza: [http://localhost:3000/organiza](http://localhost:3000/organiza)
- admin: [http://localhost:3000/admin](http://localhost:3000/admin)

## Scripts disponibles

- `npm run dev`
  desarrollo local
- `npm run typegen`
  regenera tipos de rutas de Next.js
- `npm run lint`
  analiza el codigo con ESLint
- `npm run typecheck`
  regenera tipos de Next y ejecuta TypeScript sin emitir artefactos
- `npm run test`
  ejecuta las pruebas unitarias
- `npm run build`
  compila la app para produccion
- `npm run check`
  ejecuta la cadena completa de calidad
- `npm run seed:demo`
  borra torneos, participantes, equipos y datos competitivos actuales, y crea un torneo demo completo en Supabase

## Base de datos

Las migraciones SQL viven en [supabase/migrations](./supabase/migrations). Incluyen:

- esquema completo de torneos, categorias, entries, fases, grupos, partidos y marcadores;
- triggers `updated_at`;
- broadcast de realtime por categoria;
- seed inicial de deportes.

El repositorio ya incluye configuracion de Supabase CLI en [supabase/config.toml](./supabase/config.toml).
Si apuntas a un proyecto o entorno nuevo, aplica las migraciones con el flujo habitual de Supabase CLI o desde tu pipeline de base de datos.

## Seguridad y produccion

- Las queries de lectura en App Router se marcan como dinamicas para no congelar datos durante el build.
- Se añaden cabeceras HTTP defensivas y `output: "standalone"` para despliegues mas simples.
- Se incluye `GET /api/health` para checks de plataforma o balanceador.
- `robots.txt` mantiene `/admin` fuera de indexacion publica.
- La configuracion actual deja `/admin` abierto por decision de producto. Si vas a exponer la app a internet con edicion real, añade autenticacion o restricciones de red antes de operar con terceros.

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

- El modelo de datos ya soporta equipos y el seed demo crea parejas reales, pero el panel todavia puede simplificarse mas para una operativa 100% orientada a padel.
- No se ha introducido autenticacion por usuario/rol; el panel queda abierto a proposito en esta iteracion visual y de producto.
- La consistencia multi-tabla de algunas operaciones complejas depende de varias escrituras consecutivas en Supabase, aunque se han reducido los casos de estado parcial mas obvios.
