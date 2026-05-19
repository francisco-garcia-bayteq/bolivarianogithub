# 14. Implementar acción "Compartir" del comprobante

**Prioridad**: Media-Alta

**Historia padre**: #29253

## Descripción
Implementar share sheet nativo con el comprobante: generar contenido a compartir (texto estructurado y/o imagen/PDF según estándar del canal). Si se genera imagen, renderizar la vista del comprobante a bitmap y excluir datos no permitidos (mantener cuenta enmascarada). Añadir control de permisos/almacenamiento si aplica y fallback a compartir texto si falla la generación.
