# 4. Crear flujo de autenticación biométrica y navegación a Home

**Prioridad**: Alta

**Historia padre**: #29222

## Descripción
Orquestar el flujo al abrir la app: si biometría está activa y disponible, solicitar biometría; si es exitosa, obtener/renovar sesión mediante el mecanismo definido (ej. refresh token existente) y navegar a Home (CA2). Si falla o se cancela, mostrar mensaje claro y permitir reintentar o ir a login con usuario/contraseña sin bloquear al cliente (CA3). Si el dispositivo no soporta o no tiene biometría configurada, ocultar/deshabilitar la opción y mostrar mensaje explicativo (CA4).
