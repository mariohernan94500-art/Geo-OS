# Arquitectura de Geo OS (Master App)

## Hub Central de Inteligencia
El sistema se basa en una arquitectura de **Orquestador Central (GeoCore)** con delegación a **Sub-Agentes especializados**.

```mermaid
graph TD
    User((Usuario)) --> Telegram[Bot Telegram]
    User --> Voren[Voren Frontend]
    User --> Web[EcoOrigen Web]

    Telegram --> GeoCore[GeoCore / packages/geotrouvetout]
    Voren --> API[Geo REST API]
    API --> GeoCore

    GeoCore --> Memory[(Memoria: SQLite + Firestore)]
    GeoCore --> Tools[Herramientas Nativas]
    GeoCore --> Agents[Escuadrón de Agentes]

    subgraph Agents
        Commerce[CommerceAgent] --> Shopify[Shopify API]
        WarRoom[WarRoomAgent] --> Metrics[Business Metrics]
        Security[SecurityAgent] --> Monitor[Token Monitor]
        Productivity[ProductivityAgent] --> VorenDB[Voren Tasks]
    end

    subgraph Memory
        SQLite[Caché Síncrona]
        Firestore[Fuente de Verdad Nube]
    end
```

## Flujo de Datos
1.  **Entrada**: El usuario envía una petición vía Telegram o Web.
2.  **Orquestación**: GeoCore recibe la petición, consulta la memoria reciente y decide si necesita una herramienta o un agente.
3.  **Ejecución**: Se invoca la función o el sub-agente.
4.  **Respuesta**: Se consolida el resultado y se envía al usuario, guardando todo en el historial unificado.
