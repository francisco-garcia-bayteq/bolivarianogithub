# 6. Crear servicio de front para ejecutar transferencia propia (POST) desde botón TRANSFERIR

**Prioridad**: Alta

**Historia padre**: #29253

## Descripción
Implementar el cliente/servicio en front para ejecutar la transferencia al presionar . Definir request con los campos necesarios del flujo (origen, destino, monto, comisiones/servicio, idempotency si aplica) y mapear respuesta a un modelo de resultado. Manejar estados: loading (deshabilitar taps repetidos mediante throttle/flag), éxito (navegar a Transacción Exitosa), error (mostrar mensaje y permitir reintento).
