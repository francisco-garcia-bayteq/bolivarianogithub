# 6. Implementar servicio frontend para obtener cuentas propias

**Prioridad**: Alta

**Historia padre**: #29223

## Descripción
Crear capa de servicio/repository para consumir el endpoint de cuentas propias (o servicio existente) y mapear respuesta a modelo de UI. Manejar timeouts, errores de red, códigos 4xx/5xx y reintento manual. Incluir headers de autenticación ya provistos por el SDK/capa de networking. No duplicar lógica: exponer método único getOwnAccounts().
