# 6. Implementar servicio de biometría con APIs nativas y validaciones

**Prioridad**: Alta

**Historia padre**: #29222

## Descripción
Crear/actualizar un BiometricService en el front que: (1) detecte soporte y enrolamiento (hardware disponible + biometría configurada) (CA1/CA4), (2) dispare el prompt biométrico nativo (FaceID/TouchID/Android BiometricPrompt), (3) maneje resultados/códigos de error y exponga estados para UI (reintentar/cancelar/fallback) (CA3), (4) detecte invalidación por cambio de biometría mediante invalidación de credenciales/keys según plataforma (CA5) y fuerce re-login con usuario/contraseña.
