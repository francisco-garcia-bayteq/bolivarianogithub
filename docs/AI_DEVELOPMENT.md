# Desarrollo Asistido por IA

Este documento define los principios para usar IA en el desarrollo del proyecto sin comprometer arquitectura, calidad ni seguridad.

El contexto del proyecto (arquitectura, convenciones, restricciones) se proporciona automáticamente a través de `AGENTS.md` y `.cursor/rules/`. Para el flujo de trabajo con Cursor (Plan Mode, Agent, validación), ver `docs/CURSOR_WORKFLOW.md`.

## 1. Objetivo

La IA se debe usar como acelerador de análisis, documentación, scaffolding y validación, no como reemplazo del criterio técnico del equipo.

## 2. Cuándo sí usar IA

La IA es útil para:

- resumir arquitectura y código existente
- proponer refactors pequeños o medianos
- generar esqueletos de features alineados a la arquitectura
- redactar documentación técnica
- sugerir mejoras de naming, legibilidad y consistencia
- proponer casos de prueba y flujos E2E
- detectar posibles violaciones de capas o duplicación de lógica

## 3. Cuándo no confiar ciegamente en IA

La salida de IA no debe aceptarse sin revisión cuando:

- inventa endpoints, contratos o payloads
- propone saltarse capas (`presentation -> data`, por ejemplo)
- introduce dependencias nuevas sin justificación
- genera tests que validan detalles internos en lugar de comportamiento
- altera seguridad, autenticación o persistencia sin validación humana

## 4. Reglas para aceptar código generado por IA

Antes de integrar una propuesta, validar que:

1. respeta la arquitectura del proyecto
2. no mueve lógica de negocio a pantallas o componentes visuales
3. mantiene la DI y los contratos del dominio
4. usa tipos consistentes
5. no hardcodea secretos ni datos reales
6. no introduce complejidad innecesaria
7. incluye o propone validación adecuada

## 5. Uso de IA por tipo de tarea

### Documentación

- Resumir comportamiento existente, convertir decisiones en docs accionables, mantener guías técnicas.
- Requisito: la documentación debe reflejar el código real, no un estado idealizado.

### Features nuevas

- Generar estructura base (entidad, repositorio, caso de uso, view model), proponer wiring en DI, sugerir componentes.
- Requisitos: revisar imports, naming y límites entre capas; confirmar que siga el patrón de `presentation` actual.

### Refactors

- Extraer funciones, mover lógica a casos de uso o view models, simplificar componentes extensos.
- Requisito: reducir complejidad sin cambiar comportamiento accidentalmente.

### Testing

- Proponer escenarios de prueba, convertir criterios de aceptación en flujos E2E, sugerir tests unitarios de lógica pura.
- Requisito: toda prueba generada debe revisarse para evitar falsos positivos o validaciones irrelevantes.

## 6. Checklist de revisión humana

Antes de dar por bueno un cambio asistido por IA:

- [ ] ¿El cambio hace exactamente lo pedido?
- [ ] ¿La solución sigue `domain → data → presentation`?
- [ ] ¿Los nombres son consistentes con el resto del repo?
- [ ] ¿La documentación quedó al día?
- [ ] ¿El cambio requiere o afecta un flujo Maestro?
- [ ] ¿Se verificó lint, test o validación manual razonable?

## 7. Regla final

La IA acelera el trabajo, pero la responsabilidad de arquitectura, calidad y coherencia sigue siendo del equipo.
