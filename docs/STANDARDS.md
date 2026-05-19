# Estándares de Desarrollo

Este documento formaliza los estándares observados en el repositorio y las decisiones que el equipo debe seguir para mantener consistencia técnica.

## 1. Stack y tooling oficial

El proyecto trabaja sobre el siguiente baseline:

- `React Native 0.84.x`
- `React 19.x`
- `TypeScript 5.8+`
- `React Navigation 7`
- `Zustand` para estado transversal de tema
- `ESLint` con preset `@react-native`
- `Prettier`
- `Jest` para pruebas unitarias o smoke tests puntuales
- `Maestro` como estándar para pruebas end-to-end

## 2. Estándar de arquitectura

La arquitectura base del proyecto es por capas:

- `src/domain`: reglas de negocio, entidades, contratos y casos de uso
- `src/data`: implementaciones, datasources, mappers e infraestructura
- `src/presentation`: pantallas, view models y componentes
- `src/di`: composition root y acceso al contenedor
- `src/providers`: concerns transversales como autenticación y tema
- `src/navigation`: definición de navegación

### Reglas obligatorias

1. `domain` no depende de `data`, `presentation`, React ni librerías de infraestructura.
2. `data` implementa contratos definidos en `domain`.
3. `presentation` consume casos de uso y servicios a través de `useDI()`, no importando repositorios ni datasources directamente.
4. La lógica de negocio no debe vivir en pantallas.
5. Los providers resuelven estado transversal; no deben convertirse en una capa paralela de negocio.
6. Toda nueva dependencia transversal debe registrarse en `src/di/container.ts` o justificarse explícitamente.

## 3. Organización de archivos

### Presentation

La capa `presentation` sigue enfoque feature-first:

```text
src/presentation/
  auth/
  transactions/
  components/
```

Reglas:

- Cada feature debe tener su propia carpeta.
- La pantalla principal usa sufijo `Screen`.
- La lógica de estado/UI usa el patrón `use<Feature>ViewModel`.
- Los componentes reutilizables entre features viven en `src/presentation/components/`.
- Los componentes exclusivos de un feature deben quedarse dentro del feature.

### Domain y Data

Las capas `domain` y `data` se organizan por responsabilidad técnica, no por feature. Esto evita duplicación de contratos y facilita el reuso entre flujos.

### Flujo sugerido al agregar un feature nuevo

Orden recomendado (de dominio hacia UI):

1. **Entidad** en `src/domain/entities/`.
2. **Repositorio (interfaz)** en `src/domain/repositories/`.
3. **Caso de uso** en `src/domain/usecases/`.
4. **DTO / modelo** en `src/data/models/`.
5. **Mapper** en `src/data/mappers/`.
6. **DataSource** en `src/data/datasources/<área>/` (suele empezarse con mock).
7. **Repositorio (implementación)** en `src/data/repositories/`.
8. **Wiring en DI** en `src/di/container.ts`.
9. **ViewModel** en `src/presentation/<feature>/useXxxViewModel.ts`.
10. **Pantalla** en `src/presentation/<feature>/XxxScreen.tsx`.
11. **Navegación** en `src/navigation/AppNavigator.tsx` si aplica.

Ejemplo de referencia en el repo: feature `transactions`.

## 4. Convenciones de nombres

| Tipo | Convención | Ejemplo |
|---|---|---|
| Entidad | `PascalCase` | `User.ts` |
| Repositorio de dominio | `PascalCaseRepository` | `AuthRepository.ts` |
| Caso de uso | `Verbo + Sustantivo + UseCase` | `GetTransactionsUseCase.ts` |
| Modelo de datos | `PascalCaseModel` | `TransactionModel.ts` |
| Mapper | `PascalCaseMapper` | `TransactionMapper.ts` |
| Implementación | `Nombre + Impl` | `AuthRepositoryImpl.ts` |
| DataSource | `Mock/Remote/Local + Nombre + DataSource` | `MockAuthDataSource.ts` |
| Pantalla | `FeatureScreen` | `LoginScreen.tsx` |
| ViewModel | `useFeatureViewModel` | `useLoginViewModel.ts` |
| Provider | `NombreProvider` | `AuthProvider.tsx` |
| Componente compartido | `PascalCase` descriptivo | `Button.tsx`, `ErrorMessage.tsx` |

## 5. Estándares de código

### TypeScript

- No usar `any` salvo que exista una justificación clara y documentada.
- Preferir tipos e interfaces explícitas en límites de dominio, props y servicios.
- Modelar variantes con union types cuando aplique.
- Mantener funciones pequeñas y con una única responsabilidad.

### React y React Native

- Preferir `named exports` en componentes y hooks internos del proyecto.
- Las pantallas deben renderizar UI y delegar la lógica al ViewModel.
- Los estilos dependientes del tema deben resolverse con `useTheme()` y `useMemo`.
- No hardcodear colores; usar siempre tokens del tema.

### Imports

- Mantener imports agrupados y ordenados de forma consistente.
- Evitar imports cruzados que violen capas.
- Si una pantalla necesita lógica de infraestructura, esa lógica debe exponerse primero vía dominio/DI.

## 6. Formato y lint

El repositorio ya define estos estándares:

- `ESLint`: preset `@react-native`
- `Prettier`:
  - `singleQuote: true`
  - `trailingComma: 'all'`
  - `arrowParens: 'avoid'`

### Regla práctica

Antes de cerrar un cambio, el código debe quedar compatible con:

- `npm run lint`
- `npm test` cuando aplique

## 7. Estándar de documentación

Toda decisión técnica repetible o relevante debe quedar documentada en `docs/`. Si se agrega un documento nuevo de referencia, actualizar el índice en `AGENTS.md` (y una regla en `.cursor/rules/` si aplica) para evitar duplicar el contenido en varios sitios.

Se debe actualizar documentación cuando:

- cambia la arquitectura o el wiring de dependencias
- se incorpora una convención nueva
- se crea una estrategia nueva de testing
- se adopta una herramienta nueva para desarrollo
- se agregan patrones reutilizables para features o componentes

## 8. Estándar de testing

La estrategia oficial queda dividida así:

- `Jest`: pruebas unitarias de lógica pura, smoke tests o validación puntual de hooks/componentes cuando aporten valor
- `Maestro`: pruebas end-to-end y validación de flujos de usuario

### Decisión del proyecto

Desde ahora, el testing funcional de la app debe priorizar `Maestro`. Si una tarea modifica un flujo de usuario, se debe evaluar si necesita un flujo Maestro nuevo o una actualización de uno existente.

Consultar `docs/TESTING.md` para la guía detallada.

## 9. Seguridad y datos sensibles

- No hardcodear credenciales, tokens reales ni secretos.
- No inventar contratos de API sin validarlos contra la fuente correspondiente.
- Los datos persistidos de sesión deben seguir pasando por almacenamiento seguro.
- Los ejemplos en docs deben usar datos ficticios.

## 10. Definition of Done

Un cambio se considera terminado cuando:

1. Respeta las capas y convenciones del proyecto.
2. Mantiene consistencia con tema, navegación y DI si toca esas áreas.
3. Incluye validación técnica razonable: lint, test o verificación manual según el tipo de cambio.
4. Actualiza documentación si introduce o modifica un patrón, estándar o flujo relevante.
5. Si afecta journeys de usuario, evalúa cobertura o actualización en `Maestro`.
