# 10. Back: Agregar pruebas unitarias del servicio de transferencia propia

**Prioridad**: Media-Alta

**Historia padre**: #29253

## Descripción
Implementar pruebas unitarias para casos: transferencia OK, saldo insuficiente, cuenta destino inválida/no pertenece, monto inválido, idempotencia (misma key no duplica), error de core bancario/timeout y mapeo a códigos de error estandarizados. Mockear dependencias (repositorios/adaptadores/core) y validar que se registren eventos/auditoría si aplica.
