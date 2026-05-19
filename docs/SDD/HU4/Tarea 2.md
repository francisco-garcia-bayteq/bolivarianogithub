# 2. Crear pruebas unitarias para flujo y servicios de biometría (front)

**Prioridad**: Media-Alta

**Historia padre**: #29250

## Descripción
<div>Agregar unit tests para:&nbsp; </div><div>(1) validación de disponibilidad/enrolamiento,&nbsp; </div><div>(2) activación post-login exitoso,&nbsp; </div><div>(3) persistencia segura del flag,&nbsp; </div><div>(4) manejo de errores (fallo/cancelación) y fallback a credenciales,&nbsp; </div><div>(5) caso de invalidación por cambio de biometría que obliga re-login (CA5). Mockear APIs nativas/secure storage y cubrir reducers/viewmodels/handlers del flujo. </div>
