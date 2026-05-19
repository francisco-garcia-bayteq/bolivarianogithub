# Estrategia de Testing

Este proyecto actualmente tiene una base mínima de pruebas con `Jest`, pero la decisión de equipo a partir de ahora es utilizar `Maestro` como herramienta principal para validar flujos end-to-end.

## 1. Estado actual del repositorio

Hoy existe:

- configuración de `Jest` con preset `react-native`
- un smoke test en `__tests__/App.test.tsx`
- ausencia de flujos E2E versionados
- ausencia de CI versionada dentro del repositorio

## 2. Decisión adoptada

### Herramienta estándar para E2E

`Maestro` será el estándar para testing funcional y validación de journeys de usuario.

Se usará para cubrir:

- login
- restauración de sesión
- navegación condicionada por autenticación
- visualización de transacciones
- estados vacíos y de error relevantes
- regresiones visibles para usuario final

## 3. Distribución de responsabilidades

| Tipo de prueba | Herramienta preferida | Cuándo usarla |
|---|---|---|
| Lógica pura de dominio | `Jest` | Casos de uso, mappers, utilidades y validaciones puras |
| Smoke test de render | `Jest` | Validación mínima de montaje o hooks puntuales |
| Flujo de usuario | `Maestro` | Login, navegación, carga de datos, errores, logout |
| Validación manual exploratoria | Dispositivo/emulador | Cambios visuales o de UX que todavía no estén automatizados |

## 4. Regla para nuevos desarrollos

Si una tarea cambia el comportamiento de usuario, debe evaluarse si requiere:

1. nuevo flujo Maestro
2. actualización de un flujo Maestro existente
3. verificación manual documentada si el flujo todavía no ha sido automatizado

No se recomienda sustituir E2E con snapshots o tests de implementación frágiles.

## 5. Convención propuesta para Maestro

Cuando se agregue la configuración al repo, la estructura recomendada es:

```text
.maestro/
  flows/
    auth/
    transactions/
  fixtures/
  README.md
```

### Convenciones de nombre

- Un archivo por flujo principal.
- Nombres orientados a intención de usuario.
- Ejemplos:
  - `login-success.yaml`
  - `login-invalid-credentials.yaml`
  - `transactions-list-visible.yaml`
  - `logout.yaml`

## 6. Flujos mínimos recomendados

Los primeros flujos que deberían existir cuando se incorpore Maestro son:

1. Inicio de sesión exitoso.
2. Error de autenticación.
3. Restauración de sesión al reabrir la app.
4. Visualización de la pantalla de transacciones.
5. Logout y retorno a login.

## 7. Criterios de calidad para un flujo Maestro

Un flujo E2E debe:

- cubrir un comportamiento observable por el usuario
- evitar depender de detalles internos de implementación
- usar datos previsibles o mocks controlables
- tener un objetivo único y legible
- poder servir como regresión ante cambios futuros

## 8. Relación con IA

La IA puede ayudar a:

- proponer escenarios E2E
- redactar flujos Maestro iniciales
- identificar huecos de cobertura
- convertir criterios de aceptación en validaciones automatizables

Pero todo flujo generado con IA debe revisarse manualmente antes de adoptarse.

## 9. Política temporal mientras Maestro no esté configurado

Hasta que `Maestro` quede incorporado en el repositorio:

- mantener `Jest` para smoke tests o lógica pura
- documentar qué validación manual se hizo
- dejar explícito en PR o documentación si una tarea debería derivar en un flujo Maestro posterior

## 10. Resumen operativo

- `Jest` no desaparece, pero queda como soporte para lógica puntual.
- `Maestro` es el estándar de testing funcional del proyecto.
- Toda historia que modifique un journey de usuario debe considerar cobertura E2E.
