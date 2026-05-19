# Creación de pantalla de Login Biometría

## Descripción
<div><p style="margin:0cm 0cm 8pt;font-size:11pt;font-family:Calibri, sans-serif;"><span lang=ES-MX style="font-size:10.5pt;font-family:&quot;Segoe UI&quot;,sans-serif;">Como
cliente de los canales digitales,</span><b><span lang=ES-MX style="font-size:12.0pt;"> necesito</span></b><span lang=ES-MX style="font-size:12.0pt;"> disponer
de una pantalla que me permita</span><span lang=ES-MX style="font-size:10.5pt;font-family:&quot;Segoe UI&quot;,sans-serif;"> <b>iniciar sesión en la app móvil usando biometría
(huella o reconocimiento facial)</b>,<br>
para <b>reducir el tiempo de acceso, mejorar la experiencia del usuario y
mantener un alto nivel de seguridad</b>, alineado con las políticas del banco.</span> </p><br> </div>

## Criterios de aceptación
<div><p style="margin:0cm 0cm 8pt;font-size:11pt;font-family:Calibri, sans-serif;"><span lang=ES-MX style="font-size:12.0pt;">Para
que la historia se de por aceptada debe cumplir con los siguientes puntos:</span> </p><p style="margin:0cm 0cm 8pt;font-size:11pt;font-family:Calibri, sans-serif;"><b><u><span lang=ES-MX style="font-size:12.0pt;">CA1 – Activación controlada de biometría</span></u></b> </p><ul style="margin-bottom:0cm;">
 <li style="margin:0cm 0cm 8pt;font-size:11pt;font-family:Calibri, sans-serif;"><span lang=ES-MX style="font-size:10.5pt;font-family:&quot;Segoe UI&quot;,sans-serif;">El
     cliente <b>solo puede activar la biometría después de un login exitoso</b>
     con usuario y contraseña.</span> </li>
 <li style="margin:0cm 0cm 8pt;font-size:11pt;font-family:Calibri, sans-serif;"><span lang=ES-MX style="font-size:10.5pt;font-family:&quot;Segoe UI&quot;,sans-serif;">La
     app debe validar que el dispositivo <b>soporta biometría</b>.</span> </li>
 <li style="margin:0cm 0cm 8pt;font-size:11pt;font-family:Calibri, sans-serif;"><span lang=ES-MX style="font-size:10.5pt;font-family:&quot;Segoe UI&quot;,sans-serif;">La
     preferencia queda almacenada de forma segura.</span> </li>
 <li style="margin:0cm 0cm 8pt;font-size:11pt;font-family:Calibri, sans-serif;"><span lang=ES-MX style="font-size:10.5pt;font-family:&quot;Segoe UI&quot;,sans-serif;">Se
     informa claramente al cliente que la biometría fue habilitada.</span> </li> </ul><p style="margin:0cm 0cm 8pt;font-size:11pt;font-family:Calibri, sans-serif;"><b><u><span lang=ES-MX style="font-size:12.0pt;">CA2 – Autenticación biométrica exitosa</span></u></b> </p><ul style="margin-bottom:0cm;">
 <li style="margin:0cm 0cm 8pt;font-size:11pt;font-family:Calibri, sans-serif;"><span lang=ES-MX style="font-size:10.5pt;font-family:&quot;Segoe UI&quot;,sans-serif;">Cuando
     el cliente abre la aplicación y tiene biometría activa: </span> </li>
 <ul style="margin-bottom:0cm;">
  <li style="margin:0cm 0cm 8pt;font-size:11pt;font-family:Calibri, sans-serif;"><span lang=ES-MX style="font-size:10.5pt;font-family:&quot;Segoe UI&quot;,sans-serif;">La
      app solicita autenticación biométrica.</span> </li>
  <li style="margin:0cm 0cm 8pt;font-size:11pt;font-family:Calibri, sans-serif;"><span lang=ES-MX style="font-size:10.5pt;font-family:&quot;Segoe UI&quot;,sans-serif;">Si
      la validación es correcta, el cliente accede directamente al home.</span> </li>
 </ul> </ul><p style="margin:0cm 0cm 8pt;font-size:11pt;font-family:Calibri, sans-serif;"><b><u><span lang=ES-MX style="font-size:12.0pt;">CA3 – Manejo de errores de biometría</span></u></b> </p><ul style="margin-bottom:0cm;">
 <li style="margin:0cm 0cm 8pt;font-size:11pt;font-family:Calibri, sans-serif;"><span lang=ES-MX style="font-size:10.5pt;font-family:&quot;Segoe UI&quot;,sans-serif;">Si
     la autenticación biométrica falla: </span> </li>
 <ul style="margin-bottom:0cm;">
  <li style="margin:0cm 0cm 8pt;font-size:11pt;font-family:Calibri, sans-serif;"><span lang=ES-MX style="font-size:10.5pt;font-family:&quot;Segoe UI&quot;,sans-serif;">Se
      muestra un mensaje claro y no técnico.</span> </li>
  <li style="margin:0cm 0cm 8pt;font-size:11pt;font-family:Calibri, sans-serif;"><span lang=ES-MX style="font-size:10.5pt;font-family:&quot;Segoe UI&quot;,sans-serif;">El
      cliente puede reintentar o usar usuario y contraseña.</span> </li>
 </ul>
 <li style="margin:0cm 0cm 8pt;font-size:11pt;font-family:Calibri, sans-serif;"><span lang=ES-MX style="font-size:10.5pt;font-family:&quot;Segoe UI&quot;,sans-serif;">Nunca
     se bloquea al cliente únicamente por fallos biométricos.</span> </li> </ul><p style="margin:0cm 0cm 8pt;font-size:11pt;font-family:Calibri, sans-serif;"><b><u><span lang=ES-MX style="font-size:12.0pt;">CA4 – Dispositivo no compatible o biometría no
configurada</span></u></b> </p><ul style="margin-bottom:0cm;">
 <li style="margin:0cm 0cm 8pt;font-size:11pt;font-family:Calibri, sans-serif;"><span lang=ES-MX style="font-size:10.5pt;font-family:&quot;Segoe UI&quot;,sans-serif;">Si
     el dispositivo no soporta biometría o no está configurada a nivel del
     sistema: </span> </li>
 <ul style="margin-bottom:0cm;">
  <li style="margin:0cm 0cm 8pt;font-size:11pt;font-family:Calibri, sans-serif;"><span lang=ES-MX style="font-size:10.5pt;font-family:&quot;Segoe UI&quot;,sans-serif;">La
      opción de biometría no debe estar disponible.</span> </li>
  <li style="margin:0cm 0cm 8pt;font-size:11pt;font-family:Calibri, sans-serif;"><span lang=ES-MX style="font-size:10.5pt;font-family:&quot;Segoe UI&quot;,sans-serif;">Se
      muestra un mensaje explicativo.</span> </li>
 </ul> </ul><p style="margin:0cm 0cm 8pt;font-size:11pt;font-family:Calibri, sans-serif;"><b><u><span lang=ES-MX style="font-size:12.0pt;">CA5 – Cambio de biometría en el dispositivo</span></u></b> </p><ul style="margin-bottom:0cm;">
 <li style="margin:0cm 0cm 8pt;font-size:11pt;font-family:Calibri, sans-serif;"><span lang=ES-MX style="font-size:10.5pt;font-family:&quot;Segoe UI&quot;,sans-serif;">Si
     el cliente modifica su biometría (nueva huella o rostro): </span> </li>
 <ul style="margin-bottom:0cm;">
  <li style="margin:0cm 0cm 8pt;font-size:11pt;font-family:Calibri, sans-serif;"><span lang=ES-MX style="font-size:10.5pt;font-family:&quot;Segoe UI&quot;,sans-serif;">La
      app debe solicitar nuevamente usuario y contraseña.</span> </li>
  <li style="margin:0cm 0cm 8pt;font-size:11pt;font-family:Calibri, sans-serif;"><span lang=ES-MX style="font-size:10.5pt;font-family:&quot;Segoe UI&quot;,sans-serif;">El
      cliente debe volver a habilitar la biometría de forma explícita.</span> </li>
 </ul> </ul><p style="margin:0cm 0cm 8pt;font-size:11pt;font-family:Calibri, sans-serif;margin-bottom:0cm;"><span lang=ES-MX style="font-size:10.5pt;font-family:&quot;Segoe UI&quot;,sans-serif;">&nbsp;</span> </p><p style="margin:0cm 0cm 8pt;font-size:11pt;font-family:Calibri, sans-serif;"><b><u><span lang=ES-MX style="font-size:12.0pt;">CA6 – Seguridad y cumplimiento</span></u></b> </p><ul style="margin-bottom:0cm;">
 <li style="margin:0cm 0cm 8pt;font-size:11pt;font-family:Calibri, sans-serif;"><span lang=ES-MX style="font-size:10.5pt;font-family:&quot;Segoe UI&quot;,sans-serif;">La
     aplicación: </span> </li>
 <ul style="margin-bottom:0cm;">
  <li style="margin:0cm 0cm 8pt;font-size:11pt;font-family:Calibri, sans-serif;"><b><span lang=ES-MX style="font-size:10.5pt;font-family:&quot;Segoe UI&quot;,sans-serif;">No
      almacena datos biométricos</span></b><span lang=ES-MX style="font-size:10.5pt;font-family:&quot;Segoe UI&quot;,sans-serif;">.</span> </li>
  <li style="margin:0cm 0cm 8pt;font-size:11pt;font-family:Calibri, sans-serif;"><span lang=ES-MX style="font-size:10.5pt;font-family:&quot;Segoe UI&quot;,sans-serif;">Usa
      únicamente las APIs nativas del sistema operativo.</span> </li>
  <li style="margin:0cm 0cm 8pt;font-size:11pt;font-family:Calibri, sans-serif;"><span lang=ES-MX style="font-size:10.5pt;font-family:&quot;Segoe UI&quot;,sans-serif;">Cumple
      los estándares de seguridad definidos por el banco.</span> </li>
 </ul> </ul><p style="margin:0cm 0cm 8pt;font-size:11pt;font-family:Calibri, sans-serif;"><b><u><span lang=ES-MX style="font-size:12.0pt;line-height:107%;">Escenario: Compatibilidad entre plataformas.</span></u></b> </p><ul style="margin-bottom:0cm;"><li><span lang=ES-MX style="font-size:12.0pt;">Esta funcionalidad debe ser la misma en ambas plataformas.</span> </li><ul style="margin-bottom:0cm;"><li><span lang=ES-MX style="font-size:12.0pt;">Validar en dispositivo IOS</span> </li><li><span lang=ES-MX style="font-size:12.0pt;">Validar en dispositivo Android</span> </li> </ul> </ul><br> </div>

