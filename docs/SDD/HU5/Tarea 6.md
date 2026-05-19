# 6. Back: Crear pruebas unitarias para servicios de transferencia (validación/mapeos generales)

**Prioridad**: Media-Alta

**Historia padre**: #29251

## Descripción
Implementar una única tarea de back enfocada en pruebas unitarias de la capa de servicios relacionada a transferencia: validar que los mapeos de request/response y reglas generales (p.ej., monto &gt; 0, manejo de decimales, campos opcionales como motivo) se comporten correctamente. Mockear dependencias externas (core bancario/adapters) y cubrir casos éxito/error. Mantenerlo genérico para el módulo de transferencias sin duplicar pruebas específicas de otros pasos.
