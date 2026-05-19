# 2. (NO ESTIMAR) Crear pruebas unitarias y de contrato para servicios backend de biometría

**Prioridad**: Media-Alta

**Historia padre**: #29222

## Descripción
Agregar unit tests para reglas: activación solo post-login, autenticación biométrica exitosa genera sesión válida, fallos biométricos no bloquean por sí solos (manejo de respuestas para reintento/fallback), revocación/invalidación requiere re-login y re-habilitación. Incluir pruebas de validación de entradas, autorizaciones y códigos HTTP; y contract tests básicos con los DTOs esperados por el front.
