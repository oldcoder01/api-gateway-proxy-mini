# Deployment Guide

This project supports three main deployment modes:

1. **Local development (Node.js directly)**
2. **Local development (Docker Compose)**
3. **AWS deployment (Lambda + HTTP API + RDS via Terraform)** ← recommended for cloud

---

## 1. Prerequisites

### Local development

- Node.js 20+
- npm
- Git
- Optional: Docker Desktop (for the Docker-based Postgres stack)
- Optional: Postman (for API testing)

### AWS deployment

- AWS account
- IAM user with permissions for:
  - Lambda
  - API Gateway v2 (HTTP APIs)
  - IAM roles/policies
  - RDS (already created in this flow)
- AWS CLI v2 installed and configured on your machine:
  - `aws configure` with valid access key, secret, and default region (e.g. `us-west-1`)
- Terraform installed on your machine
  - `terraform -version` should show a recent 1.5+ version

---

## 2. Local Development (Node.js only)

Run the API directly on your machine using a local Postgres instance or RDS.

### 2.1 Install dependencies

From the project root:

```bash
npm install
```

### 2.2 Configure environment

Create a `.env` file at the project root (values are examples):

```ini
PORT=3000

DB_HOST=localhost
DB_PORT=5432
DB_NAME=app_db
DB_USER=app_user
DB_PASSWORD=app_password
DB_SSL=false
```

Adjust DB settings to point at your local or cloud Postgres.

### 2.3 Start the API

```bash
npm start
```

The API listens on `http://localhost:3000` by default.

### 2.4 Test endpoints

If you have Postman, set your environment:

- `baseUrl = http://localhost:3000`

Then test:

- `GET {{baseUrl}}/status`
- `GET {{baseUrl}}/items`
- `POST {{baseUrl}}/items`
- `PUT {{baseUrl}}/items/{id}`
- `DELETE {{baseUrl}}/items/{id}`

---

## 3. Local Development (Docker Compose)

This mode runs the Node API **and** Postgres together via Docker.

### 3.1 Requirements

- Docker Desktop installed and running

### 3.2 Start the stack

From the project root:

```bash
docker compose up --build
```

This will:

- Build the `api` image
- Start:
  - `api-gateway-proxy-mini-api` (Node)
  - `api-gateway-proxy-mini-db` (Postgres 16)

Postgres is initialized using `db/init.sql`, which:

- Creates the `app_db` database (if not already present).
- Creates and seeds an `items` table.

### 3.3 Test via Postman

Set Postman environment:

- `baseUrl = http://localhost:3000`

Then call:

- `GET {{baseUrl}}/status`
- `GET {{baseUrl}}/items`

You should see two seeded items from `init.sql`.

To tear down the stack:

```bash
docker compose down
```

---

## 4. AWS Deployment (Lambda + HTTP API + RDS via Terraform)

This mode uses Terraform to deploy:

- IAM role for Lambda
- Lambda function (Node 20, using the same code as local)
- HTTP API in API Gateway v2 with the existing routes:
  - `/status`
  - `/items`
  - `/items/{id}`
- `$default` stage with auto-deploy

The Lambda is configured to talk to an **existing RDS Postgres instance** (not created by Terraform in this flow). That RDS should already have:

- Database: `app_db`
- User: e.g. `app_user`
- `items` table seeded by `init.sql`

> If you haven’t run `init.sql` against RDS yet, do that first (from CloudShell or your own machine with `psql`, with SSL enabled).

### 4.1 Build the Lambda package

From the project root, build a deployment zip:

```bash
cd path/to/api-gateway-proxy-mini

# Install dependencies without dev dependencies
npm install --omit=dev

# Create lambda-package.zip (src + node_modules + package.json)
Compress-Archive -Path src, node_modules, package.json -DestinationPath lambda-package.zip -Force
```

This produces:

- `lambda-package.zip` at the project root.

Terraform will reference this file.

### 4.2 Terraform layout

Terraform lives under:

```text
infra/terraform/
  main.tf
  variables.tf
  outputs.tf
  terraform.tfvars       # local-only, not committed (contains secrets)
```

### 4.3 Configure Terraform variables

In `infra/terraform/terraform.tfvars` (do not commit this file), configure:

```hcl
aws_region  = "us-west-1"
project_name = "api-gateway-proxy-mini"
environment  = "tfdev"

# Existing RDS instance details
db_host     = "your-rds-endpoint.rds.amazonaws.com"
db_name     = "app_db"
db_username = "app_user"
db_password = "your_strong_password"
```

- `aws_region` must match your RDS and where you want Lambda/API Gateway.
- `project_name` and `environment` combine to form resource names like
  - `api-gateway-proxy-mini-tfdev-lambda`
  - `api-gateway-proxy-mini-tfdev-http-api`

### 4.4 Initialize Terraform

From `infra/terraform`:

```bash
cd infra/terraform

terraform init
```

This:

- Downloads the AWS provider.
- Sets up the local `.terraform` directory.

### 4.5 Review the plan

```bash
terraform plan
```

You should see Terraform planning to **create**:

- 1 IAM role for Lambda
- 1 IAM role policy attachment (for CloudWatch logs)
- 1 Lambda function
- 1 HTTP API
- 1 integration
- 6 routes (`/status`, `/items`, `/items/{id}` for GET/POST/PUT/DELETE)
- 1 `$default` stage
- 1 Lambda permission

If the plan looks sane, proceed.

### 4.6 Apply the changes

```bash
terraform apply
```

Type `yes` at the prompt.

On success, Terraform prints outputs, including:

- `lambda_function_name`
- `http_api_invoke_url` (for example: `https://abc123.execute-api.us-west-1.amazonaws.com`)

### 4.7 Test the AWS HTTP API via Postman

In Postman, set your environment:

- `baseUrl = <http_api_invoke_url>`

Then:

- `GET {{baseUrl}}/status`
- `GET {{baseUrl}}/items`
- `POST {{baseUrl}}/items`
- `PUT {{baseUrl}}/items/{id}`
- `DELETE {{baseUrl}}/items/{id}`

The behavior should match your local and Docker-based API, using the same `app_db.items` table on RDS.

---

## 5. Terraform State and Git

Terraform creates state files and cache under `infra/terraform`. These **must not** be committed to Git.

Root `.gitignore` should include:

```gitignore
# Terraform
infra/terraform/.terraform/
infra/terraform/.terraform.lock.hcl
infra/terraform/terraform.tfstate
infra/terraform/terraform.tfstate.backup
infra/terraform/crash.log
infra/terraform/terraform.tfvars

# Lambda zip
lambda-package.zip
```

Terraform should be treated as the source of truth for:

- The Lambda function used in AWS
- The IAM role and permissions
- The HTTP API configuration and routes

If you later change the API code:

1. Rebuild `lambda-package.zip`.
2. Run `terraform apply` again to push the updated code.

---

## 6. Cleaning Up AWS Resources

To tear down the Terraform-managed stack (without affecting anything you created manually outside Terraform):

From `infra/terraform`:

```bash
terraform destroy
```

Type `yes` to confirm.

Terraform will delete:

- The Lambda function it created
- The IAM role and its policy attachment
- The HTTP API, routes, stage, and Lambda permission

This does **not** delete your RDS instance, since in this flow RDS is not managed by Terraform.

---

## 7. Summary

- **Local Node**: `npm start`, hits any Postgres you configure in `.env`.
- **Local Docker**: `docker compose up --build`, Node + Postgres in containers, seeded via `db/init.sql`.
- **AWS (Terraform)**:
  - `lambda-package.zip` built from the Node project.
  - Terraform creates Lambda + HTTP API wired to your existing RDS.
  - Postman points at `{{baseUrl}} = http_api_invoke_url`.

This gives you a clean, repeatable path from local dev to a real AWS deployment using infrastructure-as-code.
