# 9. Back: Implementar servicios para transferencia propia (endpoint y contrato)

**Prioridad**: Alta

**Historia padre**: #29253

## Descripción
Crear/ajustar el servicio backend que ejecuta la transferencia propia (operación inmediata) y expone el endpoint correspondiente (p.ej. POST /transfers/own/confirm). Definir y documentar contrato request/response (cuentas, monto, comisiones/servicio financiero, referencia, idempotency key si aplica). Incluir validaciones: saldo disponible, cuenta origen/destino del mismo cliente, monto &gt; 0, comisiones calculadas/validadas. Responder con identificador de transacción y datos necesarios para pantalla de éxito.
