import 'dotenv/config';
import { ejecutarGenerarCodigo } from '../src/agent/tools/generar_codigo.js';
import { writeFileSync } from 'fs';

(async () => {
  const r = await ejecutarGenerarCodigo({
    descripcion: 'Calculadora de propinas con campos para monto y porcentaje, que muestre el total con y sin propina',
  });
  const parsed = JSON.parse(r);
  if (parsed.ok) {
    writeFileSync('/tmp/calculadora-propinas.html', parsed.codigo);
    console.log('✅ Guardado en /tmp/calculadora-propinas.html');
    console.log('   Tamaño:', parsed.tamano_bytes, 'bytes');
    console.log('');
    console.log('Para ver: xdg-open /tmp/calculadora-propinas.html');
  } else {
    console.error('❌', parsed);
  }
})();
