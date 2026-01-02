# ETLab Docker Setup

## Quick Start (SQLite - Default)

```bash
docker-compose -f docker/docker-compose.yml up -d
```

Access ETLab at http://localhost

## Deployment Options

Additional deployment configurations are available in `docs/deployment/`:

| File | Description | Command |
|------|-------------|---------|
| `docker-compose.yml` | Default (SQLite) | `docker-compose -f docker/docker-compose.yml up -d` |
| `docker-compose.postgres.yml` | PostgreSQL | `docker-compose -f docs/deployment/docker-compose.postgres.yml up -d` |
| `docker-compose.mysql.yml` | MySQL | `docker-compose -f docs/deployment/docker-compose.mysql.yml up -d` |
| `docker-compose.full.yml` | Full stack + Airflow | `docker-compose -f docs/deployment/docker-compose.full.yml up -d` |
| `docker-compose.airflow.yml` | Airflow standalone | `docker-compose -f docs/deployment/docker-compose.airflow.yml up -d` |

## Full Stack (ETLab + Airflow)

```bash
docker-compose -f docs/deployment/docker-compose.full.yml up -d
```

### Services and Ports

| Service | URL | Credentials |
|---------|-----|-------------|
| ETLab | http://localhost | - |
| Airflow | http://localhost:8080 | admin / admin |

### Viewing DAGs in Airflow

1. Open ETLab at http://localhost
2. Create a new DAG page (click "New Page" > "Airflow DAG")
3. Add tasks to your DAG canvas
4. Click "Sync to Airflow" to save the DAG
5. Click "Visualize in Airflow" to open in Airflow UI

## Stopping Services

```bash
# Default
docker-compose -f docker/docker-compose.yml down

# Full stack
docker-compose -f docs/deployment/docker-compose.full.yml down

# Remove volumes (clears all data)
docker-compose -f docker/docker-compose.yml down -v
```

## Configuration

Copy `.env.example` to `.env` and customize:

```bash
cp docker/.env.example docker/.env
```

Key settings:
- `JWT_SECRET_KEY` - Required for production (generate with `openssl rand -base64 32`)
- `DATABASE_URL` - Database connection string
- `SPARK_MASTER` - Spark cluster URL or `local[*]`

## Troubleshooting

### Airflow not starting
- Ensure Docker has at least 4GB memory
- Wait 60-90 seconds for initialization
- Check logs: `docker logs airflow`

### DAGs not appearing
- DAGs sync every 10 seconds
- Check: `docker/airflow/dags/`

### Container won't start
- Check logs: `docker logs etlab`
- Verify port 80 is available
