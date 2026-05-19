# 3. (NO ESTIMAR) Implementar servicios backend para habilitación y login con biometría

**Prioridad**: Alta

**Historia padre**: #29222

## Descripción
<div>Crear/ajustar endpoints/servicios generales para: <br>(1) registrar/activar método biométrico para el usuario SOLO tras login exitoso (ej. asociar dispositivo + estado, sin almacenar biometría) (CA1/CA6), <br>(2) autenticar vía biometría usando un esquema seguro basado en tokens/llaves del dispositivo y challenge/response o refresh token según arquitectura existente (CA2/CA6), <br>(3) revocar/deshabilitar biometría para el dispositivo/usuario y manejar invalidaciones (CA5).<br>Incluir validaciones, códigos de respuesta y contratos necesarios para el front. </div>
