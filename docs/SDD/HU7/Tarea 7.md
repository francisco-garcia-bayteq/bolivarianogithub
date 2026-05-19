# 7. Implementar control anti-doble envío (idempotencia/lock) en Confirmación

**Prioridad**: Alta

**Historia padre**: #29253

## Descripción
Evitar ejecuciones múltiples de transferencia por taps consecutivos: implementar un lock de ejecución en el ViewModel/Presenter y, si el backend soporta, enviar header/clave de idempotencia por transacción. Asegurar que el botón se mantenga habilitado según criterio de historia, pero que la acción esté protegida (por ejemplo, ignorar taps mientras hay request en curso y mostrar indicador de progreso).
