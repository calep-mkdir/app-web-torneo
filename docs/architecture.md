# Arquitectura

## Vision general

La aplicacion separa claramente tres capas:

- `src/app`
  rutas y pantallas de Next.js
- `src/features`
  casos de uso, consultas y transformaciones por area funcional
- `src/lib`
  utilidades compartidas, acceso a Supabase y motor de brackets

## Areas funcionales

### Publico

Ubicacion principal:

- [src/app/(public)](../src/app/%28public%29)
- [src/components/public](../src/components/public)
- [src/features/public](../src/features/public)

Responsabilidades:

- portada publica con resumen de actividad;
- listado de torneos publicados;
- exploracion por deportes;
- pagina de organizacion;
- detalle por torneo;
- cambio de categoria;
- vista de partidos pendientes y resultados cerrados;
- visualizacion del bracket;
- historial por participante.

### Administracion

Ubicacion principal:

- [src/app/admin](../src/app/admin)
- [src/components/admin](../src/components/admin)
- [src/features/admin](../src/features/admin)

Responsabilidades:

- crear y editar torneos;
- crear categorias;
- registrar participantes;
- crear fases y rondas;
- crear partidos;
- registrar resultados.

### Tiempo real

Ubicacion principal:

- [src/features/live](../src/features/live)

Responsabilidades:

- obtener snapshots completos de una categoria;
- escuchar eventos realtime por `category:<category_id>`;
- aplicar cambios incrementales cuando es seguro;
- rehacer snapshot si el cambio afecta a estructura.

## Motor de bracket

Ubicacion principal:

- [src/lib/brackets/bracketEngine.ts](../src/lib/brackets/bracketEngine.ts)
- [src/lib/brackets/supabaseAdapter.ts](../src/lib/brackets/supabaseAdapter.ts)

Separacion:

- `bracketEngine.ts`
  dominio puro del bracket, sin dependencia de Supabase.
- `supabaseAdapter.ts`
  traduce filas de base de datos al modelo de runtime y genera parches para persistir el avance del cuadro.

## Acceso a entorno y seguridad

- [src/lib/env/server.ts](../src/lib/env/server.ts)
  valida entorno de servidor.
- [src/lib/env/client.ts](../src/lib/env/client.ts)
  valida entorno publico del navegador.
- [src/app/robots.ts](../src/app/robots.ts)
  deja `/admin` fuera de indexacion.

La version actual no añade autenticacion a `/admin`; esa capa queda como decision de plataforma o de una iteracion futura.

## Modelo de datos

Las migraciones de [supabase/migrations](../supabase/migrations) crean:

- catalogos base: `sports`, `tournaments`, `categories`;
- competidores: `participants`, `teams`, `entries`, `entry_members`;
- estructura competitiva: `stages`, `groups`, `group_entries`, `stage_rounds`;
- operacion de juego: `matches`, `match_slots`, `match_scores`, `match_events`;
- vistas auxiliares para historico de participantes;
- triggers `updated_at`;
- broadcast realtime por categoria.

## Flujo de una categoria knockout

1. Admin crea categoria.
2. Admin crea fase `knockout`.
3. Admin crea rondas.
4. Admin crea partidos y asigna participantes.
5. Admin carga resultado.
6. El servidor genera el parche del bracket y actualiza siguientes cruces.
7. Supabase emite broadcast por la categoria.
8. La web publica actualiza la vista y refleja los nuevos estados y resultados.
