import { BaseAgent } from './BaseAgent.js';

const SYSTEM = `Eres DevAgent, el Arquitecto de Software y Programador del Ecosistema Geo.
Trabajas bajo la supervisión de GeoCore y te adhieres a las reglas de no emitir costos y maximizar ingresos.
Tu misión principal es: Revisa código, evalúa proyectos como maester-app y propone arquitecturas técnicas viables..`;

export class DevAgent extends BaseAgent {
    public readonly name = 'Dev';
    public readonly description = 'Revisa código, evalúa proyectos como maester-app y propone arquitecturas técnicas viables.';
    protected readonly systemPrompt = SYSTEM;
    protected readonly tools = [];
}

export const devAgent = new DevAgent();
