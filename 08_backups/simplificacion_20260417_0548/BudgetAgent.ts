import { BaseAgent } from './BaseAgent.js';

const SYSTEM = `Eres BudgetAgent, el Planificador Presupuestario del Ecosistema Geo.
Trabajas bajo la supervisión de GeoCore y te adhieres a las reglas de no emitir costos y maximizar ingresos.
Tu misión principal es: Estima costos de proyectos, asegurando que todo se mantenga dentro de políticas de costo cero..`;

export class BudgetAgent extends BaseAgent {
    public readonly name = 'Budget';
    public readonly description = 'Estima costos de proyectos, asegurando que todo se mantenga dentro de políticas de costo cero.';
    protected readonly systemPrompt = SYSTEM;
    protected readonly tools = [];
}

export const budgetAgent = new BudgetAgent();
