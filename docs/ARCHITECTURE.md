# API Gateway Proxy Mini – Architecture

## High-Level Flow

Client -> API Gateway (HTTP API) -> Lambda (httpApiHandler) -> Router -> Controllers -> Services -> (DynamoDB later)

## Components

- **API Gateway HTTP API**
  - Routes: `GET /status`, `GET /items` (for now).

- **Lambda: httpApiHandler**
  - Entry point for all routes.
  - Uses `event.routeKey` to select controller.

- **App Layer**
  - `router.js`: route dispatch logic.
  - `controllers/*`: translate HTTP events into service calls.
  - `services/*`: business logic and data access (DynamoDB later).
  - `utils/response.js`: consistent JSON responses.

## Runtime Modes

1. **Lambda + API Gateway (serverless)**  
   - Entry: `src/handlers/httpApiHandler.handler`  
   - Event routed via `router.js` → controllers → services.

2. **Dockerized Node API (containerized)**  
   - Entry: `src/server.js` (Express app)  
   - Exposed on port 3000.
   - Can run via:
     - `npm start`
     - `docker build/run`
     - `docker compose up` (with Postgres stub).
