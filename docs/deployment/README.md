# ETLab Deployment

Choose the deployment option that fits your needs:

## Deployment Options

| File | Description | Use Case |
|------|-------------|----------|
| `docker-compose.yml` | ETLab only (SQLite) | Getting started, development |
| `docker-compose.airflow.yml` | ETLab + Airflow (PostgreSQL) | Full stack with DAG orchestration |
| `docker-compose.external-db.yml` | ETLab + Airflow (External DB) | Production with your own database |

## Quick Start

### Option 1: ETLab Only (Simplest)

```bash
docker-compose -f docs/deployment/docker-compose.yml up -d
```

Access: http://localhost

### Option 2: ETLab + Airflow (Full Stack)

```bash
docker-compose -f docs/deployment/docker-compose.airflow.yml up -d
```

Access:
- ETLab: http://localhost
- Airflow: http://localhost:8080 (admin/admin)

### Option 3: External Database (Production)

```bash
DATABASE_URL=postgresql+asyncpg://user:pass@your-db:5432/etlab \
docker-compose -f docs/deployment/docker-compose.external-db.yml up -d
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | Database connection string | SQLite |
| `JWT_SECRET_KEY` | JWT signing secret (required for production!) | - |
| `APP_ENV` | Environment mode | production |
| `LOG_LEVEL` | Logging level | INFO |
| `SPARK_MASTER` | Spark master URL | local[*] |
| `LIVY_URL` | Apache Livy URL | - |
| `DATABRICKS_HOST` | Databricks workspace URL | - |
| `DATABRICKS_TOKEN` | Databricks access token | - |
| `DATABRICKS_CLUSTER_ID` | Databricks cluster ID | - |

## Database URL Examples

```bash
# PostgreSQL
DATABASE_URL=postgresql+asyncpg://user:pass@host:5432/etlab

# MySQL
DATABASE_URL=mysql+aiomysql://user:pass@host:3306/etlab

# SQLite (default)
DATABASE_URL=sqlite+aiosqlite:///./data/etlab.db
```

## Stopping Services

```bash
# Stop services
docker-compose -f docs/deployment/<config-file>.yml down

# Stop and remove volumes
docker-compose -f docs/deployment/<config-file>.yml down -v
```

## Production Checklist

1. Set `JWT_SECRET_KEY` (generate with `openssl rand -base64 32`)
2. Use PostgreSQL or MySQL instead of SQLite
3. Configure proper backup for database volumes
4. Set up reverse proxy with SSL (nginx, traefik, etc.)
