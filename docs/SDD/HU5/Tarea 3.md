# 3. Asegurar controles de seguridad en UI (no exposición/registro de datos sensibles)

**Prioridad**: Media-Alta

**Historia padre**: #29251

## Descripción
Revisar la pantalla para evitar fuga de información: no registrar en logs analíticos el número de cuenta completo, saldo o monto; enmascarar datos en logs; proteger estados al ir a background (si el estándar del canal aplica: blur/screenshot protection). Validar que el motivo no permita inyección de caracteres no permitidos. Alinear con lineamientos de seguridad móvil del proyecto.
