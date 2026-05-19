# 5. Validaciones de seguridad y entrada en pantalla 'Ingreso del monto'

**Prioridad**: Alta

**Historia padre**: #29223

## Descripción
Agregar validaciones en cliente: monto requerido, numérico, mayor a 0, máximo 2 decimales, y no exceder saldo disponible (si el saldo está disponible). Motivo opcional/ requerido según criterio del canal (si no existe definición, implementar opcional con límite de longitud p.ej. 140 y sanitización). Deshabilitar botón cuando el formulario no sea válido. Evitar logs con números de cuenta completos; en logs/analytics enmascarar (últimos 4).
