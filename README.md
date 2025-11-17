# API Gateway Proxy Mini

A small backend API used as a stepping stone for your cloud career accelerator plan.

It gives you:

- A **Node.js + Express** API with a simple internal structure (router → controllers → services).
- A **PostgreSQL** database wired in for real `/items` CRUD.
- A **Dockerfile** and **docker-compose** so you can run the whole stack locally.
- A shared controller/service layer that can also be reused from a **Lambda handler** later.

---

## Tech Stack

- **Language:** Node.js (CommonJS)
- **Web framework:** Express
- **Database:** PostgreSQL 16 (via `pg` + connection pool)
- **Container:** Docker, docker-compose
- **Planned cloud runtimes:**
  - Container image → ECR → ECS/Fargate (or similar)
  - Lambda + API Gateway (via `src/handlers/httpApiHandler.js` and `src/app/router.js`)

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
      httpApiHandler.js        # Lambda entrypoint (for future API Gateway integration)
    app/
      router.js                # RouteKey → controller mapping
      controllers/
        healthController.js    # /status
        itemsController.js     # /items (GET + POST)
      services/
        itemsService.js        # DB-backed item logic
      utils/
        response.js            # JSON response helper for Lambda
      db/
        client.js              # Postgres Pool + query helper

  db/
    init.sql                   # Creates items table + seeds rows on first startup

  docs/
    ARCHITECTURE.md
    DEPLOYMENT.md

  notes/
    daily-log.md               # (optional) personal notes
```

---

## API Endpoints

Current HTTP endpoints (Express / Docker mode):

- `GET /status`
  - Returns basic health/status info about the service.
- `GET /items`
  - Returns all items from the `items` table in Postgres.
- `POST /items`
  - Creates a new item in the database.
  - Request body (JSON):

    ```json
    {
      "name": "Example item name"
    }
    ```

  - Response: the created item (id, name, createdAt).

---

## Postman

- Environment
    - postman/environment/Base.json

- Collection
    - postman/collections/837632-44454a9e-8cd0-449d-9c27-84e12a22ab54.json
```

---

## Running Locally (Node only, no Docker)

**Prerequisites**

- Node.js 18+ (you’re on 22, which is fine)
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

Test endpoints:

```text
GET http://localhost:3000/status
GET http://localhost:3000/items
POST http://localhost:3000/items
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

### Test requests

From a terminal:

```bash
# Health
curl http://localhost:3000/status

# List items
curl http://localhost:3000/items

# Create a new item (PowerShell escaping)
curl -X POST http://localhost:3000/items ^
  -H "Content-Type: application/json" ^
  -d "{\"name\":\"New item from API\"}"
```

Or using a GUI client (Postman, Insomnia) with the same URLs and JSON bodies.

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

## Next Steps / Roadmap

- Add more CRUD endpoints for `/items` (GET by id, PUT, DELETE).
- Add basic validation and error mapping.
- Containerize for AWS deployment:
  - Build + push image to ECR.
  - ECS/Fargate service with a public ALB.
- Or wire the existing router + controllers to API Gateway + Lambda via `httpApiHandler.js` for the serverless variant.

For more detail on structure and flows, see:

- `docs/ARCHITECTURE.md`
- `docs/DEPLOYMENT.md`
