# 4. Integrar modelo de confirmación desde el estado del flujo (Paso 1/2 -> Paso 3)

**Prioridad**: Alta

**Historia padre**: #29253

## Descripción
Conectar la pantalla de confirmación para consumir el estado generado en pasos previos (cuenta origen, cuenta destino, monto, servicio financiero, banco beneficiario, titular). Validar que no se recalculen datos en UI y que se usen las mismas fuentes del flujo. Implementar mapeo DTO/Domain-&gt;UI Model (si aplica) y manejo de nulos con placeholders definidos por diseño.
