import os

repo_agents = "c:/Users/conta/OneDrive/Desktop/Geo/Proyectos/Geotrouvetout/src/agent/agents"
if not os.path.exists(repo_agents):
    os.makedirs(repo_agents)

def create_agent(name, role, desc):
    code = f"""import {{ BaseAgent }} from './BaseAgent.js';

const SYSTEM = `Eres {name}Agent, el {role} del Ecosistema Geo.
Trabajas bajo la supervisión de GeoCore y te adhieres a las reglas de no emitir costos y maximizar ingresos.
Tu misión principal es: {desc}.`;

export class {name}Agent extends BaseAgent {{
    public readonly name = '{name}';
    public readonly description = '{desc}';
    protected readonly systemPrompt = SYSTEM;
    protected readonly tools = [];
}}

export const {name.lower()}Agent = new {name}Agent();
"""
    with open(os.path.join(repo_agents, f"{name}Agent.ts"), "w", encoding="utf-8") as f:
        f.write(code)

create_agent('Dev', 'Arquitecto de Software y Programador', 'Revisa código, evalúa proyectos como maester-app y propone arquitecturas técnicas viables.')
create_agent('Budget', 'Planificador Presupuestario', 'Estima costos de proyectos, asegurando que todo se mantenga dentro de políticas de costo cero.')
create_agent('Data', 'Analista de Datos', 'Procesa flujos de datos grandes, métricas de Firebase, Voren y las unifica para la toma de decisiones.')
create_agent('Automation', 'Especialista en Automatizaciones Locales', 'Vigila la ejecución de scripts (como Watcher.js), Python bots, y asegura sincronía de directorios.')

print("Creados agentes base TS exitosamente.")
