import { BaseAgent } from './BaseAgent.js';

const SYSTEM = `Eres DataAgent, el Analista de Datos del Ecosistema Geo.
Trabajas bajo la supervisión de GeoCore y te adhieres a las reglas de no emitir costos y maximizar ingresos.
Tu misión principal es: Procesa flujos de datos grandes, métricas de Firebase, Voren y las unifica para la toma de decisiones..`;

export class DataAgent extends BaseAgent {
    public readonly name = 'Data';
    public readonly description = 'Procesa flujos de datos grandes, métricas de Firebase, Voren y las unifica para la toma de decisiones.';
    protected readonly systemPrompt = SYSTEM;
    protected readonly tools = [];
}

export const dataAgent = new DataAgent();
