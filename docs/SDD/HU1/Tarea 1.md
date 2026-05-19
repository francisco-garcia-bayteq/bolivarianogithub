# 1. (NO ESTIMAR) Aplicar controles de seguridad y cumplimiento en backend para biometría

**Prioridad**: Media-Alta

**Historia padre**: #29222

## Descripción
Asegurar que el backend no reciba/almacene datos biométricos; auditar payloads para solo manejar identificadores de dispositivo, llaves públicas/handles o referencias permitidas por seguridad del banco. Implementar rate limiting/anti-bruteforce para intentos de autenticación biométrica, logging seguro (sin secretos), y políticas de expiración/revocación de tokens asociados a biometría.
