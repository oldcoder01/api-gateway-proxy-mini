# Deployment – API Gateway Proxy Mini

This document describes how to:

1. Run the service locally in Docker (current main workflow).
2. Run the service locally via Node only.
3. Prepare the service for deployment to AWS (container or Lambda).

---

## 1. Local Deployment – Docker + docker-compose (Recommended)

This is the default dev/test deployment.

### First-Time Setup / Reset

From the project root:

```bash
docker compose down -v          # stop containers and remove volumes (DB reset)
docker compose up --build       # build images and start services
```

- `api` service: Node + Express API (`src/server.js`)
- `db` service: Postgres 16 (`postgres:16-alpine`)
  - Runs `db/init.sql` on first startup to create schema and seed data.

### Normal Start (keeping DB data)

```bash
docker compose up --build
# or (if you did not change code):
docker compose up
```

The API will be available at:

```text
http://localhost:3000
```

Examples:

```bash
curl http://localhost:3000/status
curl http://localhost:3000/items
curl http://localhost:3000/items/1
```

You can then use `POST`, `PUT`, and `DELETE` against `/items` for full CRUD.

---

## 2. Local Deployment – Node Only (Without Docker)

If you prefer to run just Node (e.g., debugging, stepping through):

1. Ensure you have a Postgres instance running and reachable.
2. Set environment variables to point at that DB:

   ```bash
   # Example (PowerShell syntax would differ)
   export DB_HOST=localhost
   export DB_PORT=5432
   export DB_USER=app_user
   export DB_PASSWORD=app_password
   export DB_NAME=app_db
   ```

3. Install dependencies and start:

   ```bash
   npm install
   npm start
   ```

The server listens on `PORT` env (default `3000`):

```text
http://localhost:3000/status
http://localhost:3000/items
```

You can exercise all endpoints as documented in `README.md`.

---

## 3. Packaging for Lambda (Serverless Variant)

The codebase also supports a Lambda-style entry via:

- `src/handlers/httpApiHandler.js`
- `src/app/router.js`

### Build a Lambda Zip

From project root:

```bash
npm install --omit=dev

# Linux/macOS
zip -r lambda-package.zip src node_modules package.json

# Windows PowerShell
Compress-Archive -Path src, node_modules, package.json -DestinationPath lambda-package.zip -Force
```

### Create / Update Lambda Function (Manual Console Flow)

1. In AWS Console → Lambda → **Create function**
   - Author from scratch
   - Runtime: Node.js 18.x or 20.x
   - Function name: `api-gateway-proxy-mini`
2. Set **handler** to:

   ```text
   src/handlers/httpApiHandler.handler
   ```

3. Upload `lambda-package.zip` as the function code.
4. Save/Deploy the function.

### Wire to API Gateway HTTP API (Manual Console Flow)

1. Create an **HTTP API** in API Gateway.
2. Add routes:
   - `GET /status`
   - `GET /items`
   - `GET /items/{id}`
   - `POST /items`
   - `PUT /items/{id}`
   - `DELETE /items/{id}`
3. For each route, set the integration to your Lambda function.
4. Deploy to a stage (e.g. default).
5. Test via the Invoke URL, e.g.:

   ```text
   GET https://xxxxxx.execute-api.<region>.amazonaws.com/status
   ```

> Note: For Lambda + API Gateway using Postgres, you will also need:
> - Network access to the DB (RDS or self-hosted),
> - Correct `DB_*` env vars configured on the Lambda function,
> - Potentially a VPC attachment if you use RDS in private subnets.

---

## 4. Container Deployment to AWS (Planned)

Eventually, this same container image can be deployed to AWS using:

1. **Build image locally**:

   ```bash
   docker build -t api-gateway-proxy-mini-api .
   ```

2. **Tag & push to ECR** (conceptual; exact commands depend on your account/region):

   ```bash
   # after aws ecr get-login-password etc.
   docker tag api-gateway-proxy-mini-api:latest <your-account>.dkr.ecr.<region>.amazonaws.com/api-gateway-proxy-mini-api:latest
   docker push <your-account>.dkr.ecr.<region>.amazonaws.com/api-gateway-proxy-mini-api:latest
   ```

3. **Create ECS service (Fargate)**:
   - Task definition:
     - Container image: ECR image above.
     - Port mapping: container `3000`.
   - Service:
     - Behind an Application Load Balancer (ALB).
     - Public-facing, with security group allowing HTTP/HTTPS.

4. **Database**:
   - Use RDS for managed Postgres.
   - Update task definition environment:
     - `DB_HOST` – RDS endpoint
     - `DB_PORT` – usually `5432`
     - `DB_USER`, `DB_PASSWORD`, `DB_NAME`

This gives you a clear path from:

- **Local dev** → Docker + Postgres
- → **Lambda + API Gateway** for serverless
- → **ECS/Fargate** for containerized production workloads.

---

## 5. Git & CI/CD (Future Enhancements)

- Add a CI pipeline (GitHub Actions, GitLab CI, etc.) to:
  - Run tests / lint (once you add them).
  - Build Docker image.
  - Optionally push to ECR on main branch or tagged releases.
- Add infra-as-code (Terraform / CDK) to:
  - Create ECR repo.
  - Provision ECS service + ALB.
  - Optionally create RDS and associated networking.

For now, the key is that you have **a documented, repeatable process** for:

- Running locally (Node & Docker),
- Packaging for Lambda,
- And a clear conceptual path to AWS container deployment.
