# 3. Implementar navegación: selección de cuenta destino -> 'Ingreso del monto'

**Prioridad**: Alta

**Historia padre**: #29223

## Descripción
Al seleccionar una cuenta del listado, navegar a la pantalla de 'Ingreso del monto' enviando por parámetros/estado: cuenta origen (preseleccionada del flujo), cuenta destino seleccionada (beneficiaria) y datos necesarios para render (tipo, descripción, número, saldo disponible, nombre titular si aplica). Evitar navegación si la cuenta destino no es válida (null) y registrar evento de error controlado.
