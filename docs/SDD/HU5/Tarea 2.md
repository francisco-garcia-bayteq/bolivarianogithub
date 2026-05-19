# 2. Integrar servicio front para obtención de datos de cuentas (origen/destino) a mostrar en Paso 1

**Prioridad**: Media-Alta

**Historia padre**: #29251

## Descripción
Consumir el/los servicios existentes del front (SDK/API client) para cargar datos necesarios de cuenta origen/destino (tipo, número, titular, banco, saldo disponible). Implementar capa de servicio/repository (si aplica), manejo de loading/error, y mapeo a modelo de UI. No duplicar endpoints: reutilizar el cliente ya usado en el flujo de transferencia de la misma épica. Agregar logs controlados y manejo de reintentos según estándar del canal.
