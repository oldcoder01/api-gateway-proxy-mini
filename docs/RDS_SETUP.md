# RDS Postgres Setup (Cheat Sheet)

This app uses **PostgreSQL** in two environments:

- **Local dev:** Postgres in Docker (`db` service, database = `app_db`)
- **Cloud:** AWS **RDS Postgres** (database = `app_db`)

The goal is to make both environments look the same to the app.

---

## 1. Local vs Cloud Database Names

- Local Docker Postgres uses the DB name from `docker-compose.yml`:
  - `POSTGRES_DB=app_db`
- RDS Postgres by default only creates a DB called **`postgres`** unless you specify one.

For consistency, we:

1. Create a database named **`app_db`** on RDS.
2. Run the same schema from `db/init.sql` into that DB.
3. Point the app (Lambda / container) at `DB_NAME=app_db`.

---

## 2. Create the RDS Postgres Instance

1. In AWS Console → **RDS → Databases → Create database**:
   - Engine: **PostgreSQL**
   - Template: Free tier / Dev/Test is fine
   - DB instance identifier: `api-gateway-proxy-mini-db` (or similar)
   - Master username: `app_user` (example)
   - Master password: choose a strong one
2. For learning/dev:
   - You can set **Public access = Yes** so tools outside AWS can connect more easily.
   - Security group: we’ll open port 5432 for your IP in the next step.

> This is *not* production-secure, but fine for a training / demo DB.

---

## 3. Open Security Group (so you can actually reach it)

1. On the RDS instance page → **Connectivity & security**:
   - Note the **Endpoint** (e.g. `api-gateway-proxy-mini-db.xxxxxx.us-west-1.rds.amazonaws.com`)
2. Click the attached **VPC security group**.
3. In the EC2 SG page → **Inbound rules → Edit inbound rules**:
   - Add:
     - **Type:** PostgreSQL
     - **Port:** 5432
     - **Source:** `My IP` (recommended for dev)
4. Save.

Now the RDS endpoint should be reachable from your IP or from CloudShell.

---

## 4. Connect to RDS and Create `app_db`

You can do this from **AWS CloudShell** (no local tools needed).

1. Open **CloudShell** (top bar in AWS console) in the same region as the DB.
2. Install a Postgres client if needed (one of these should work):

   ```bash
   sudo yum install -y postgresql15 || sudo yum install -y postgresql
   ```

3. Connect to the default `postgres` database using SSL:

   ```bash
   PGPASSWORD='<YOUR_DB_PASSWORD>' psql      "host=<RDS_ENDPOINT>       port=5432       dbname=postgres       user=app_user       sslmode=require"
   ```

   Replace:

   - `<RDS_ENDPOINT>` with your actual RDS endpoint (no `https://`, just the host).
   - `app_user` / password with what you set at creation.

4. At the `postgres=>` prompt, create the `app_db` database:

   ```sql
   CREATE DATABASE app_db;
   ```

5. Switch into it:

   ```sql
   \c app_db
   ```

   Prompt should change to `app_db=>`.

---

## 5. Initialize Schema in `app_db`

Open the local file `db/init.sql` and copy its contents. It should look like:

```sql
CREATE TABLE IF NOT EXISTS items (
    id          SERIAL PRIMARY KEY,
    name        VARCHAR(255) NOT NULL,
    created_at  TIMESTAMP NOT NULL DEFAULT NOW()
);

INSERT INTO items (name) VALUES
  ('First item'),
  ('Second item')
ON CONFLICT DO NOTHING;
```

In the `app_db=>` prompt, paste that SQL and run it.

Then verify:

```sql
SELECT * FROM items;
```

You should see the two seed rows.

---

## 6. Environment Variables (Local vs Lambda)

### Local (Docker)

`docker-compose.yml` already wires the API container to the `db` service with:

```yaml
environment:
  DB_HOST: db
  DB_PORT: 5432
  DB_USER: app_user
  DB_PASSWORD: app_password
  DB_NAME: app_db
```

This matches the `POSTGRES_*` settings for the local Postgres container.

### Lambda / Cloud

On the Lambda function (`api-gateway-proxy-mini`), set env vars:

```text
DB_HOST     = <RDS_ENDPOINT>
DB_PORT     = 5432
DB_USER     = app_user
DB_PASSWORD = <YOUR_DB_PASSWORD>
DB_NAME     = app_db
DB_SSL      = true
```

If you use a single connection string instead, you can set:

```text
DATABASE_URL = postgres://app_user:<PW>@<RDS_ENDPOINT>:5432/app_db
DB_SSL       = true
```

The DB client (`src/app/db/client.js`) automatically uses `DATABASE_URL` if present, otherwise falls back to `DB_*` variables.

---

## 7. Common Errors & What They Mean

- `FATAL: database "app_db" does not exist`  
  → You connected to the server, but that database hasn’t been created yet.  
  **Fix:** Connect to `dbname=postgres`, run `CREATE DATABASE app_db;`, then `\c app_db` and run `init.sql`.

- `no pg_hba.conf entry for host "X.X.X.X", user "app_user", database "app_db", no encryption`  
  → RDS is configured to **require SSL**, but your client is not using it.  
  **Fix:** Add `sslmode=require` in your psql connection string, and set `DB_SSL=true` (or SSL options) in your app env.

- `connection timed out`  
  → Network path blocked (wrong SG/VPC/public access).  
  **Fix:** Make sure:
  - RDS **Public access = Yes** (for dev), and  
  - Security group inbound rule allows PostgreSQL (5432) from your IP or the client’s security group.

---

## 8. Sanity Checks

- From CloudShell:

  ```bash
  PGPASSWORD='<PW>' psql     "host=<RDS_ENDPOINT> port=5432 dbname=app_db user=app_user sslmode=require"
  ```

  Then:

  ```sql
  SELECT * FROM items;
  ```

- From Lambda test events:

  - `routeKey = "GET /items"`  
    → Should return the items from RDS `app_db.items`.

  - `routeKey = "GET /status"`  
    → Should return `"status": "ok"` and `"db": "ok"` if the DB check passes.

Once both local Docker and Lambda point at a DB named `app_db` with the same schema, the app behaves consistently across environments.
