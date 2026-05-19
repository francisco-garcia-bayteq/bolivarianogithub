# Documentación Técnica

Este directorio concentra la documentación viva del proyecto. Debe mantenerse alineado con el código y actualizarse cuando cambien decisiones de arquitectura, estándares o flujos de trabajo.

## Documentos disponibles

| Documento | Propósito |
|---|---|
| `ARCHITECTURE.md` | Arquitectura en detalle: capas, DI, flujos y decisiones de diseño. |
| `STANDARDS.md` | Normativa principal del proyecto: arquitectura, organización, flujo de features, naming, código, lint, testing, seguridad, Definition of Done. |
| `TESTING.md` | Estrategia de testing con Jest y Maestro, estructura `.maestro/`. |
| `AI_DEVELOPMENT.md` | Principios y límites para usar IA en el desarrollo. |
| `CURSOR_WORKFLOW.md` | Flujo de trabajo con Cursor: Plan Mode, Agent, validación. |
| `THEMING.md` | Sistema de temas, tokens de color, `useTheme` y `useStyles`. |
| `SHARED_COMPONENTS.md` | Convenciones para componentes compartidos en `presentation/components/`. |
| `ref/` | Material de referencia bajo demanda: diseños, specs de API, flujos, research. Ver `ref/README.md`. |

## Orden recomendado de lectura

1. `ARCHITECTURE.md`
2. `STANDARDS.md`
3. `TESTING.md`
4. `AI_DEVELOPMENT.md`
5. `CURSOR_WORKFLOW.md`

## Estado actual

- El proyecto es una app React Native única, no un monorepo.
- La arquitectura base es `domain → data → presentation`, con DI manual en `src/di`.
- La sesión se gestiona en `AuthProvider` y la navegación depende del estado autenticado.
- El theming es transversal y se resuelve con `ThemeProvider` + Zustand.
- Hoy existe testing básico con Jest, pero el estándar para flujos end-to-end es Maestro.

## Regla de mantenimiento

Si una tarea cambia alguno de estos puntos, la documentación relacionada en `docs/` debe actualizarse dentro del mismo cambio.
