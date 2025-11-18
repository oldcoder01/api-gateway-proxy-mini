# API Gateway Proxy Mini

A small backend API used as a stepping stone for your cloud career accelerator plan.

It gives you:

- A **Node.js + Express** API with a simple internal structure (router → controllers → services).
- A **PostgreSQL** database wired in for real `/items` CRUD.
- A **Dockerfile** and **docker-compose** so you can run the whole stack locally.
- A shared controller/service layer that can also be reused from a **Lambda handler**.
- A working **AWS Lambda + API Gateway + RDS Postgres** deployment path you can talk through in interviews.

---

## Tech Stack

- **Language:** Node.js (CommonJS)
- **Web framework:** Express
- **Database:** PostgreSQL 16 (via `pg` + connection pool)
- **Container:** Docker, docker-compose
- **Cloud runtimes supported:**
  - Local / Docker: Express API + Postgres container
  - Lambda + API Gateway HTTP API (handler: `src/handlers/httpApiHandler.js`)
  - RDS Postgres (`app_db`) as the cloud database

---

## Project Structure (high level)

```text
api-gateway-proxy-mini/
  README.md
  package.json
  Dockerfile
  docker-compose.yml

  src/
    server.js                  # Express HTTP server (local + container)
    handlers/
      httpApiHandler.js        # Lambda entrypoint for API Gateway HTTP API
    app/
      router.js                # routeKey → controller mapping (Lambda)
      controllers/
        healthController.js    # /status
        itemsController.js     # /items CRUD
      services/
        itemsService.js        # DB-backed item logic
      utils/
        response.js            # JSON response helper for Lambda
        errors.js              # badRequest/notFound/internalError helpers
      db/
        client.js              # Postgres Pool + query helper

  db/
    init.sql                   # Creates items table + seeds rows on first startup

  postman/
    collections/
      837632-44454a9e-8cd0-449d-9c27-84e12a22ab54.json      # Postman test collection
    environment/
      base.json                                             # Base Postman environment
      aws.json                                             # AWS Postman environment

  docs/
    ARCHITECTURE.md
    DEPLOYMENT.md
    RDS_SETUP.md

  notes/
    daily-log.md               # (optional) personal notes
```

---

## API Endpoints

Current HTTP endpoints (Express / Docker mode and Lambda / API Gateway mode):

- `GET /status`
  - Returns basic health/status info about the service and DB connectivity.

- `GET /items`
  - Returns all items from the `items` table in Postgres.

- `GET /items/{id}`
  - Returns a single item by numeric id.
  - Response:
    - `200` with item JSON if found.
    - `404` if the item does not exist.

- `POST /items`
  - Creates a new item in the database.
  - Request body (JSON):

    ```json
    {
      "name": "Example item name"
    }
    ```

  - Response: `201` with the created item (id, name, createdAt).

- `PUT /items/{id}`
  - Updates the name of an existing item.
  - Request body (JSON):

    ```json
    {
      "name": "Updated name"
    }
    ```

  - Response:
    - `200` with the updated item.
    - `404` if the item does not exist.

- `DELETE /items/{id}`
  - Deletes an existing item.
  - Response:
    - `204` on successful delete.
    - `404` if the item does not exist.

---

## Postman

- Collection
  - `postman/collections/837632-44454a9e-8cd0-449d-9c27-84e12a22ab54.json`
- Environment
  - `postman/environment/base.json` (defines `baseUrl`)

All requests in the collection are intended to use the `{{baseUrl}}` variable. This allows you to switch between:

- Local dev: `http://localhost:3000`
- AWS HTTP API: `https://<api-id>.execute-api.<region>.amazonaws.com/<stage>`

by simply changing the active Postman environment (or the `baseUrl` value), without duplicating the collection.

---

## Running Locally (Node only, no Docker)

**Prerequisites**

- Node.js 18+ (you are on 22, which is fine)
- A running Postgres instance, or update env vars to point at your chosen DB

**Steps**

```bash
# from project root
npm install

# (optional) set env vars if you're not using docker-compose defaults:
#   DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME

npm start
```

Server will listen on:

```text
http://localhost:3000
```

Test endpoints (examples):

```text
GET    http://localhost:3000/status
GET    http://localhost:3000/items
GET    http://localhost:3000/items/1
POST   http://localhost:3000/items
PUT    http://localhost:3000/items/1
DELETE http://localhost:3000/items/1
```

---

## Running with Docker & docker-compose (recommended dev flow)

This mode runs:

- `api` service: Node + Express container
- `db` service: Postgres 16 with `init.sql` auto-run on first startup

**First time / when you want to reset the DB:**

```bash
docker compose down -v          # stop containers and remove volumes
docker compose up --build       # build images + start stack
```

On subsequent runs (keeping DB data):

```bash
docker compose up --build       # or just: docker compose up
```

The API will be available at:

```text
http://localhost:3000
```

You can exercise all endpoints as documented above or via the Postman collection.

---

## Database Schema

Defined in `db/init.sql`:

```sql
CREATE TABLE IF NOT EXISTS items (
    id          SERIAL PRIMARY KEY,
    name        VARCHAR(255) NOT NULL,
    created_at  TIMESTAMP NOT NULL DEFAULT NOW()
);
```

- On the first run of the Postgres container (with a fresh volume), `init.sql`:
  - Creates the `items` table if needed.
  - Seeds a couple of example rows.

The API maps DB rows → JSON with fields:

```json
{
  "id": 1,
  "name": "Example item",
  "createdAt": "2025-11-17T12:42:47.000Z"
}
```

---

## Cloud Deployment Overview

The same controller/service layer is used in a Lambda function behind an API Gateway HTTP API, connected to an RDS Postgres instance configured as described in `docs/RDS_SETUP.md`.

High level:

- API Gateway HTTP API → Lambda (`src/handlers/httpApiHandler.js`)
- Lambda → router (`src/app/router.js`) → controllers → services
- Services → DB client (`src/app/db/client.js`) → RDS Postgres (`app_db`)

For step-by-step deployment and Lambda/API Gateway wiring, see:

- `docs/DEPLOYMENT.md`
- `docs/RDS_SETUP.md`
- `docs/ARCHITECTURE.md`
