# 13. Integrar servicio para obtener detalle/confirmación de transferencia

**Prioridad**: Alta

**Historia padre**: #29253

## Descripción
Consumir el servicio requerido para renderizar el comprobante (ya sea endpoint de confirmación o detalle por referencia). Implementar capa de servicio/repository en front con manejo de estados (loading/success/error) y caché en memoria para evitar re-llamadas al volver a la pantalla. Asegurar que la referencia (comprobante) y fecha/hora vengan del backend y no del dispositivo, cuando esté disponible.
