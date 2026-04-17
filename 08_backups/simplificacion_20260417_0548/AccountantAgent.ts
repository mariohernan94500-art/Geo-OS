import { BaseAgent } from './BaseAgent.js';
import { generarRespuesta } from '../llm.js';
import { memoria } from '../memory.js';

const ACCOUNTANT_SYSTEM = `Eres AccountantAgent — el contador de Geo OS. Llevas las cuentas al día.

⚠️ No soy contador certificado. Para declaraciones de impuestos, consultar profesional.

NEGOCIO: VITRA / EcoOrigen Chile. Moneda: CLP. Fuentes: Shopify, transferencias, MercadoPago, efectivo.

FUNCIONES:
1. REGISTRAR ventas: fecha, monto, producto, medio de pago → guardar_hecho tag:"venta"
2. REGISTRAR gastos: fecha, monto, categoría → guardar_hecho tag:"gasto"
3. REPORTES: diario/semanal/mensual con formato claro

CATEGORÍAS GASTO: 🔧Material | 📦Envíos | 🛠️Herramientas | 💻Servicios digitales | 📱Marketing | 🏠Infraestructura | 📋Otros

FORMATO REPORTE:
💰 FINANZAS — [período]
━━━━━━━━━━━━━━━━━━━
📈 Ingresos: $XX.XXX
📉 Gastos: $XX.XXX
💵 Resultado: +/- $XX.XXX
📊 Margen: XX%
🏦 Caja estimada: $XXX.XXX
━━━━━━━━━━━━━━━━━━━
💡 [1 observación o recomendación]

ALERTAS:
- Gastos >40% de ingresos → advertir
- IVA teórico: separar 19% de ventas como referencia
- Marzo: "Operación Renta en abril, prepara datos"

REGLAS:
- SIEMPRE CLP con punto de miles ($25.000)
- Guardar con guardar_hecho tags "venta" o "gasto"
- Si no tiene datos, preguntar "¿Cómo fueron las ventas hoy?"
- No inventar números
- Tener siempre un resumen listo para enviar a contador real`;

export class AccountantAgent extends BaseAgent {
    public readonly name = 'Accountant';
    public readonly description = 'Contabilidad: registra ventas y gastos, reportes financieros, flujo de caja, preparación tributaria. Todo en CLP.';
    protected readonly systemPrompt = ACCOUNTANT_SYSTEM;
    protected readonly tools = [];

    public async delegate(context: string, userId: string): Promise<string> {
        console.log('[AccountantAgent] 💰 Procesando finanzas...');

        // Recuperar transacciones recientes de memoria
        const ventas = memoria.obtenerHechos(userId, 20)
            .filter(h => h.toLowerCase().includes('venta') || h.includes('$'));
        const gastos = memoria.obtenerHechos(userId, 20)
            .filter(h => h.toLowerCase().includes('gasto') || h.toLowerCase().includes('gasté'));

        let ctx = context;
        if (ventas.length > 0 || gastos.length > 0) {
            ctx += '\n\n[TRANSACCIONES EN MEMORIA]';
            if (ventas.length > 0) ctx += '\nVentas: ' + ventas.slice(-5).join(' | ');
            if (gastos.length > 0) ctx += '\nGastos: ' + gastos.slice(-5).join(' | ');
        }

        const msgs = [
            { role: 'system', content: this.systemPrompt },
            { role: 'user', content: ctx }
        ];
        const res = await generarRespuesta(msgs, 'llama-3.3-70b-versatile', null, userId, 'accountant');
        return res.content || 'No pude procesar esa consulta financiera.';
    }
}

export const accountantAgent = new AccountantAgent();
