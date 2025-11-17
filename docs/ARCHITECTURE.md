# API Gateway Proxy Mini – Architecture

This mini-project is a small but realistic backend you can reuse in multiple environments:

- Local development (Node + Express)
- Local development via Docker + Postgres
- Cloud runtimes (Lambda + API Gateway, or container in ECS/Fargate)

---

## High-Level Architecture (Docker dev mode)

```text
Client (curl/Postman/Browser)
        |
        v
  Express API (Node, src/server.js)
        |
        v
  Controllers (health, items)
        |
        v
  Services (itemsService)
        |
        v
  DB Client (pg Pool)
        |
        v
  PostgreSQL (db service in docker-compose)
```

### Components

- **Express API (`src/server.js`)**
  - Listens on `PORT` (default `3000`).
  - Defines HTTP routes:
    - `GET /status`
    - `GET /items`
    - `GET /items/:id`
    - `POST /items`
    - `PUT /items/:id`
    - `DELETE /items/:id`
  - Delegates actual work to controllers so the same business logic can be reused from Lambda.

- **Controllers (`src/app/controllers/*`)**
  - **`healthController.js`**
    - Implements `getHealthStatus(event, context)`.
    - Returns service status, service name, request id, and timestamp.
  - **`itemsController.js`**
    - `listItems(event, context)` – fetches all items.
    - `getItemByIdHandler(event, context)` – fetches one item by id.
    - `createItemHandler(event, context)` – creates a new item from `event.body`.
    - `updateItemHandler(event, context)` – updates an existing item.
    - `deleteItemHandler(event, context)` – deletes an item by id.

- **Services (`src/app/services/itemsService.js`)**
  - `getAllItems()` – queries the database for all items, sorted by `created_at` desc.
  - `getItemById(id)` – queries for a single item by id.
  - `createItem(name)` – inserts a new item and returns the created row.
  - `updateItem(id, name)` – updates the name of an item and returns the updated row.
  - `deleteItem(id)` – deletes an item and returns a boolean indicating success.
  - Contains the domain/business logic and DB access; controllers stay thin.

- **DB Client (`src/app/db/client.js`)**
  - Wraps a `pg.Pool`.
  - Reads connection details from environment:
    - `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`.
  - Exposes:
    - `query(text, params)` – for simple queries.
    - (Optionally) `getClient()` – for explicit transactions if needed later.

- **PostgreSQL (`db` service in `docker-compose.yml`)**
  - Image: `postgres:16-alpine`.
  - Credentials:
    - `POSTGRES_USER=app_user`
    - `POSTGRES_PASSWORD=app_password`
    - `POSTGRES_DB=app_db`
  - Uses a Docker volume for persistent data.
  - Runs initialization script `db/init.sql` on first startup.

---

## Data Model

### `items` Table

Defined in `db/init.sql`:

```sql
CREATE TABLE IF NOT EXISTS items (
    id          SERIAL PRIMARY KEY,
    name        VARCHAR(255) NOT NULL,
    created_at  TIMESTAMP NOT NULL DEFAULT NOW()
);
```

### API Representation

The API exposes items as:

```json
{
  "id": 1,
  "name": "Some item",
  "createdAt": "2025-11-17T12:42:47.000Z"
}
```

Note the camelCase `createdAt` in JSON vs `created_at` in the DB.

---

## Runtime Modes

### 1. Express / Docker Mode (Primary Dev Flow)

- Entry point: `src/server.js`
- Typical command:

  ```bash
  docker compose up --build
  ```

- Request flow:

  ```text
  HTTP request (/status or /items/*)
      -> Express route handler
      -> controller function
      -> service function
      -> DB client query
      -> Postgres
      -> back up the chain as JSON response
  ```

### 2. Lambda + API Gateway Mode (Planned / Partial)

- **Handler:** `src/handlers/httpApiHandler.js`
- **Router:** `src/app/router.js`
- API Gateway HTTP API routes (example):

  - `GET /status`
  - `GET /items`
  - `GET /items/{id}`
  - `POST /items`
  - `PUT /items/{id}`
  - `DELETE /items/{id}`

- Request flow in Lambda mode:

  ```text
  Client
    -> API Gateway (HTTP API)
      -> Lambda (httpApiHandler)
        -> router.js (routeKey switch)
          -> controller (health/items)
          -> services (itemsService)
          -> DB (future: RDS / DynamoDB)
  ```

- `src/app/utils/response.js` helps format Lambda responses consistently.

This allows you to share controllers/services between:

- A "normal" containerized Node API, and
- A serverless Lambda function behind API Gateway.

---

## Environment Configuration

Core environment variables:

- **Express / Docker:**
  - `PORT` (optional, default `3000`)
- **Database:**
  - `DB_HOST` (default `localhost` in code; `db` container in docker-compose)
  - `DB_PORT` (default `5432`)
  - `DB_USER` (`app_user` in docker-compose)
  - `DB_PASSWORD` (`app_password` in docker-compose)
  - `DB_NAME` (`app_db` in docker-compose)

In `docker-compose.yml`, these are wired automatically for the `api` service.

---

## Extension Points

- Add more resources beyond `/items` (users, orders, etc.) with similar controller/service patterns.
- Extend the data model (extra tables, relations) with additional SQL migrations / init scripts.
- Introduce validation/middleware layers around controllers for auth, logging, etc.
- Add infra-as-code:
  - Terraform, CDK, or CloudFormation templates for:
    - VPC, security groups
    - ECS/Fargate service & ALB
    - RDS (if you want managed Postgres)
  - Or SAM / CDK for Lambda + API Gateway.

This structure is intentionally simple but production-aligned so you can talk through it in interviews and migrate it to real AWS services later.
