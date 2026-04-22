# Despliegue

## Requisitos previos

- Variables de entorno configuradas.
- Proyecto Supabase accesible desde el entorno de despliegue.
- Migraciones aplicadas antes del primer arranque.

## Opcion 1: despliegue Node/Next.js

Pasos recomendados:

1. Instalar dependencias:

```bash
npm ci
```

2. Ejecutar validacion completa:

```bash
npm run check
```

3. Compilar:

```bash
npm run build
```

4. Arrancar:

```bash
npm run start
```

Notas:

- El proyecto usa `output: "standalone"`, por lo que el despliegue es apto para entornos tipo container o Node dedicado.
- El endpoint de health queda disponible en `/api/health`.

## Opcion 2: Docker

Construccion:

```bash
docker build -t app-web-torneo .
```

Ejecucion:

```bash
docker run --rm -p 3000:3000 \
  -e NEXT_PUBLIC_SITE_URL=https://tu-dominio.com \
  -e NEXT_PUBLIC_SUPABASE_URL=... \
  -e NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=... \
  -e SUPABASE_SERVICE_ROLE_KEY=... \
  -e ADMIN_BASIC_AUTH_USER=admin \
  -e ADMIN_BASIC_AUTH_PASSWORD='cambia-esto' \
  app-web-torneo
```

## Variables que no deben faltar en produccion

- `NEXT_PUBLIC_SITE_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `ADMIN_BASIC_AUTH_USER`
- `ADMIN_BASIC_AUTH_PASSWORD`

## Recomendaciones de plataforma

- Activa HTTPS obligatoriamente.
- Gestiona secretos desde el vault nativo de la plataforma.
- Usa checks contra `/api/health`.
- Mantén el panel `/admin` fuera de indexacion publica.
- Si tienes reverse proxy, conserva `X-Forwarded-*` y no elimines `Authorization`.

## Pipeline minimo recomendado

1. `npm ci`
2. `npm run check`
3. aplicar migraciones de Supabase
4. desplegar build o imagen
5. validar `/api/health`
6. hacer smoke test de `/tournaments` y `/admin`
