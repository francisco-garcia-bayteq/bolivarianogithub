# 5. Implementar seguridad de front: prevenir captura de pantalla y ocultar datos en background

**Prioridad**: Media-Alta

**Historia padre**: #29253

## Descripción
Aplicar medidas de seguridad en la pantalla de confirmación: bloquear screenshots/recording donde la plataforma lo permita y ocultar la vista (blur/placeholder) al pasar a background/app switcher. Controlar el ciclo de vida para activar/desactivar estas medidas solo en pantallas sensibles del flujo. Validar comportamiento en iOS y Android y documentar cualquier limitación técnica.
