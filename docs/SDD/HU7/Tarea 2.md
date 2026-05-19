# 2. Implementar formateo monetario y presentación de montos en Confirmación

**Prioridad**: Media-Alta

**Historia padre**: #29253

## Descripción
Aplicar el mismo formato monetario usado anteriormente para: 'Monto a transferir' y 'Servicios financieros' (comisiones/servicio). Centralizar en un helper/formatter existente o crear uno nuevo para evitar duplicación. Asegurar redondeo/decimales y separadores según locale definido por el canal. Incluir pruebas unitarias del formatter (casos: entero, decimales, cero, montos altos).
