# 1. Maquetar pantalla Paso 1 'Ingreso del monto' (transferencia propias cuentas)

**Prioridad**: Alta

**Historia padre**: #29251

## Descripción
Implementar la UI del paso 1 de transferencia entre mis cuentas siguiendo el AC: bloque 'Cuenta Origen' (título, tipo+N° en claro, saldo disponible), bloque 'Cuenta Destino/Beneficiaria' (titular, tipo+descripción, N° en claro, banco), sección 'Ingreso del monto' con prefijo $ y formato visual, sección 'Motivo' opcional. Incluir layout responsive, estados vacíos/carga para datos de cuentas, y componentes reutilizables (AccountCard/AmountInput/ReasonInput). Sin lógica de navegación aún (solo render y wiring básico).
Desarrollar componente de entrada de monto que muestre teclado numérico (mobile), aplique máscara/formateo en tiempo real: símbolo $, coma para miles y punto para decimales. Validaciones: permitir solo números y separador decimal; limitar a 2 decimales; normalizar a valor numérico interno (decimal) para enviar al flujo. Exponer callbacks onChange(valueNumber, valueFormatted) y estados de error si el formato es inválido. Asegurar consistencia iOS/Android (evitar diferencias de locale usando formateador explícito).

Crear input alfanumérico opcional para motivo con máximo 30 caracteres. Validar y bloquear/mostrar error cuando se ingresen caracteres no permitidos; caracteres permitidos: letras/números, espacio, punto (.), guion (-). Implementar sanitización (trim opcional) y conteo de caracteres. Exponer valor final para el request/estado del flujo.
Implementar lógica para que el botón  inicie deshabilitado y se habilite únicamente cuando el monto sea válido y mayor a 0. Mantener el botón deshabilitado si el monto es vacío/NaN/0 o presenta error de formato. Integrar con el estado de formulario (p.ej. React Hook Form/Formik o estado propio) y contemplar accesibilidad (focus/disabled).
Al presionar , navegar a la pantalla 'Confirmar la transferencia' pasando el payload necesario (cuenta origen, cuenta destino, monto numérico, monto formateado, motivo). Persistir el estado del flujo en store (Redux/MobX/Context) o en params de navegación de forma segura para evitar pérdida al volver. Incluir acción 'volver' manteniendo los valores ingresados.
