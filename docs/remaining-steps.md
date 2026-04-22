# Pasos que faltan fuera de Codex

Estado actual de esta puesta en marcha:

- el repositorio ya existe en GitHub;
- el proyecto ya compila y pasa `lint`, `typegen`, `typecheck`, `test` y `build`;
- la base de datos de Supabase ya tiene esquema, realtime y seed inicial aplicados.

Lo que queda ahora ya es principalmente operacion real, contenido y endurecimiento final.

## 1. Elegir hosting para la primera salida

La opcion mas simple suele ser `Vercel`.

Alternativas compatibles:

- Railway
- Render
- Fly.io
- cualquier runtime Node con `npm run build` y `npm run start`
- Docker usando el [Dockerfile](../Dockerfile)

## 2. Conectar el repo al hosting

Importa [calep-mkdir/app-web-torneo](https://github.com/calep-mkdir/app-web-torneo) desde la plataforma elegida.

## 3. Cargar variables de entorno de produccion

Usa los nombres de [.env.example](../.env.example):

- `NEXT_PUBLIC_SITE_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

## 4. Lanzar el primer deploy

Una vez cargados los secretos:

- ejecuta el deploy inicial;
- confirma que el build termina correctamente;
- valida que el dominio final responde por HTTPS.

## 5. Hacer smoke test funcional

Comprueba al menos:

- `GET /api/health` devuelve `200`;
- `/` carga;
- `/tournaments` carga;
- `/deportes` carga;
- `/organiza` carga;
- `/admin` abre directamente;
- puedes crear un torneo;
- puedes crear categorias, participantes y partidos;
- al guardar resultados, la parte publica refleja los cambios.

## 6. Crear contenido inicial real

La tabla `sports` ya esta sembrada, pero aun necesitas cargar tus datos operativos:

- torneos reales;
- categorias;
- participantes o equipos;
- primeros partidos.

## 7. Activar observabilidad minima

Lo minimo recomendable:

- logs centralizados;
- alerta si falla `/api/health`;
- captura de errores de servidor;
- monitorizacion de tiempos de respuesta.

## 8. Decidir como quieres proteger `/admin` en internet abierta

La app funciona sin login porque asi se ha decidido para esta version.

Antes de delegar gestion a terceros o exponer edicion real, elige una de estas vias:

- autenticacion dentro de la app;
- proteccion por plataforma;
- restriccion de red o IP;
- acceso solo para uso interno.

## 9. Opcional: crear un `SUPABASE_ACCESS_TOKEN`

No hace falta para que la app funcione ni para el estado actual de la base.

Si quieres usar despues `supabase link` y otros flujos CLI enlazados sin depender de `--db-url`, crea un token personal en Supabase y guardalo solo en tu entorno local.

## 10. Recomendado: rotar claves sensibles compartidas durante la puesta a punto

Como durante el onboarding se han usado credenciales administrativas para dejar todo listo:

- rota la `SUPABASE_SERVICE_ROLE_KEY` si quieres cerrar completamente este ciclo con higiene de secretos;
- cambia la password de Postgres si consideras esa credencial ya expuesta;
- actualiza esos valores en tu hosting despues de rotarlos.
