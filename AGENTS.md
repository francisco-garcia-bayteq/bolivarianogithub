# AGENTS.md — BBApp

## Proyecto

App de banca móvil para Banco Bolivariano. React Native + TypeScript + React. Las versiones y el stack están en `docs/STANDARDS.md` y `README.md`.

## Documentación

Las reglas de código y arquitectura viven en `docs/`. Las reglas de Cursor (`.cursor/rules/`) tienen las restricciones clave para trabajar de inmediato y remiten a `docs/` cuando hace falta más contexto.

| Documento | Qué contiene |
|---|---|
| `docs/STANDARDS.md` | Arquitectura, organización, flujo al agregar un feature, naming, código, formato/lint, testing, seguridad, Definition of Done. |
| `docs/ARCHITECTURE.md` | Capas en detalle, DI, flujos y decisiones de diseño. |
| `docs/TESTING.md` | Jest, Maestro, estructura `.maestro/`, criterios E2E. |
| `docs/THEMING.md` | Tokens de color, `useTheme`, `useStyles`, `useMemo`. |
| `docs/SHARED_COMPONENTS.md` | Componentes en `src/presentation/components/`. |
| `docs/AI_DEVELOPMENT.md` | Principios para usar IA en el desarrollo. |
| `docs/CURSOR_WORKFLOW.md` | Flujo de trabajo con Cursor: Plan Mode, Agent, validación. |

## Composición

`App.tsx` arma la jerarquía: `DIProvider → AuthProvider → ThemeProvider → SafeAreaProvider → NavigationContainer → AppNavigator`. El detalle está en `docs/ARCHITECTURE.md`.

## Comandos

`npm run lint`, `npm test`, `npm start`, `npm run android`, `npm run ios`. Prerequisitos y tabla completa en `README.md`.

## Reglas y material operativo de Cursor

- `.cursor/rules/*.mdc`: restricciones que Cursor aplica según contexto; remiten a `docs/` para el detalle.
- `.cursor/plans/`: planes guardados desde Plan Mode (historial y retomar trabajo).
- `.cursor/commands/*.md`: flujos con `/` en el chat (`feature`, `review`, `pr`), inspirados en el enfoque del repo hermano `bbh`.

Qué va en cada subcarpeta: `.cursor/README.md`.

Si cambia una convención, actualizar el documento de `docs/` correspondiente y ajustar la regla o el comando si quedó desactualizado.
