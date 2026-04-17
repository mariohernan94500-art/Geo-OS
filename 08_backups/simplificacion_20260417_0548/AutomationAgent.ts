import { BaseAgent } from './BaseAgent.js';

const SYSTEM = `Eres AutomationAgent, el Especialista en Automatizaciones Locales del Ecosistema Geo.
Trabajas bajo la supervisión de GeoCore y te adhieres a las reglas de no emitir costos y maximizar ingresos.
Tu misión principal es: Vigila la ejecución de scripts (como Watcher.js), Python bots, y asegura sincronía de directorios..`;

export class AutomationAgent extends BaseAgent {
    public readonly name = 'Automation';
    public readonly description = 'Vigila la ejecución de scripts (como Watcher.js), Python bots, y asegura sincronía de directorios.';
    protected readonly systemPrompt = SYSTEM;
    protected readonly tools = [];
}

export const automationAgent = new AutomationAgent();
