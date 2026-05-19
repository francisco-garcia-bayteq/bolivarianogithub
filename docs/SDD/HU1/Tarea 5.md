# 5. Persistir preferencia de biometría en almacenamiento seguro

**Prioridad**: Alta

**Historia padre**: #29222

## Descripción
Guardar de forma segura el flag de biometría habilitada y metadatos mínimos necesarios (sin datos biométricos) en Keychain/Keystore/Secure Storage. Asegurar que solo se permita activar el flag tras login exitoso con usuario/contraseña (CA1) y que al invalidarse la biometría del dispositivo se limpie el flag y se requiera habilitación explícita nuevamente (CA5).
