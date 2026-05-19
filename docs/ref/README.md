# Material de referencia

Esta carpeta guarda insumos que alimentan el desarrollo pero no son normativa del proyecto. Se organiza en subcarpetas por tipo de contenido y se crean bajo demanda: si la carpeta no existe, crearla al agregar el primer archivo.

## Estructura

```
docs/ref/
├── designs/       # Mockups, wireframes, capturas de pantalla, exports de Figma
├── api/           # Contratos de API: specs OpenAPI, colecciones Postman, ejemplos de respuesta
├── flows/         # Diagramas de flujo de usuario, mapas de navegación
├── research/      # Notas de investigación, benchmarks, comparativas técnicas
└── <otro>/        # Cualquier categoría que haga falta; crearla y documentar su propósito aquí
```

## Convenciones

- Cada subcarpeta puede tener su propio `README.md` breve si el contenido no es autoexplicativo.
- Los archivos deben tener nombres descriptivos: `login-flow-v2.png`, `transactions-api-spec.yaml`, no `captura1.png`.
- Si un archivo referenciado desde código o docs cambia de ubicación, actualizar los links.
- El material aquí no reemplaza la documentación de `docs/`; es un insumo, no una norma.

## Cómo se usa en el flujo de trabajo

Al especificar una tarea (ver `docs/CURSOR_WORKFLOW.md`), se puede mencionar material de referencia con `@` en Cursor. Por ejemplo:

- "Implementar esta pantalla siguiendo `@docs/ref/designs/home-v3.png`"
- "Conectar este endpoint según `@docs/ref/api/transactions-spec.yaml`"
- "El flujo de usuario está en `@docs/ref/flows/onboarding.md`"

Esto le da al agente contexto visual o contractual concreto sin tener que pegar contenido en el chat.
