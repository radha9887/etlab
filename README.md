<p align="center">
  <img src="docs/logo.svg" alt="ETLab Logo" width="120" />
</p>

<h1 align="center">ETLab</h1>

<p align="center">
  <strong>Build PySpark & Airflow pipelines visually. No code required.</strong>
</p>

<p align="center">
  <a href="#quick-start">Quick Start</a> •
  <a href="#features">Features</a> •
  <a href="#demo">Demo</a> •
  <a href="#documentation">Docs</a> •
  <a href="#contributing">Contributing</a>
</p>

<p align="center">
  <a href="https://github.com/radha9887/etlab/stargazers"><img src="https://img.shields.io/github/stars/radha9887/etlab?style=social" alt="GitHub Stars"></a>
  <a href="https://github.com/radha9887/etlab/blob/main/LICENSE"><img src="https://img.shields.io/badge/License-MIT-yellow.svg" alt="License: MIT"></a>
  <a href="https://hub.docker.com/r/radhakrishnans/etlab"><img src="https://img.shields.io/badge/Docker-Ready-2496ED?logo=docker&logoColor=white" alt="Docker"></a>
  <img src="https://img.shields.io/badge/PySpark-3.5-E25A1C?logo=apachespark&logoColor=white" alt="PySpark">
  <img src="https://img.shields.io/badge/Airflow-2.7-017CEE?logo=apacheairflow&logoColor=white" alt="Airflow">
</p>

<br/>

<p align="center">
  <img src="docs/demo.gif" alt="ETLab Demo" width="800" />
</p>

---

## Why ETLab?

| Problem | ETLab Solution |
|---------|----------------|
| Writing PySpark code is time-consuming | **Drag & drop** nodes, get production-ready code instantly |
| Starting from scratch every time | **40+ templates**: Medallion, CDC, Streaming, Data Quality, and more |
| Airflow DAGs require boilerplate | **Visual DAG builder** with 100+ operators and 12+ ready-to-use templates |
| Hard to onboard new team members | **No-code interface** anyone can use |
| Testing pipelines is slow | **Execute directly** against local Spark or remote clusters |
| Managing multiple tools | **All-in-one**: ETL design, code generation, execution, and orchestration |

---

## Quick Start

**One command. That's it.**

```bash
docker run -d -p 80:80 --name etlab radhakrishnans/etlab:latest
```

Open http://localhost and start building.

<details>
<summary><strong>Other installation options</strong></summary>

### Using Pre-built Image

```bash
# Pull from Docker Hub
docker pull radhakrishnans/etlab:latest

# Run
docker run -d -p 80:80 --name etlab radhakrishnans/etlab:latest
```

### Docker Compose - Standalone

Create `docker-compose.yml`:

```yaml
services:
  etlab:
    image: radhakrishnans/etlab:latest
    container_name: etlab
    ports:
      - "80:80"
    volumes:
      - etlab_data:/data
    environment:
      - JWT_SECRET_KEY=your-secret-key-here
      - SPARK_MASTER=local[*]
    restart: unless-stopped

volumes:
  etlab_data:
```

```bash
docker-compose up -d
```

### Docker Compose - Full Stack with PostgreSQL + Airflow

Create `docker-compose.yml`:

```yaml
services:
  etlab:
    image: radhakrishnans/etlab:latest
    container_name: etlab
    ports:
      - "80:80"
    volumes:
      - etlab_data:/data
      - airflow_dags:/app/airflow/dags
    environment:
      - DATABASE_URL=postgresql+asyncpg://etlab:etlab123@postgres:5432/etlab
      - JWT_SECRET_KEY=your-secret-key-here
      - AIRFLOW_HOST=http://airflow:8080
      - AIRFLOW_DAGS_PATH=/app/airflow/dags
    depends_on:
      postgres:
        condition: service_healthy
    networks:
      - etlab-network
    restart: unless-stopped

  postgres:
    image: postgres:15
    container_name: etlab-postgres
    environment:
      - POSTGRES_USER=etlab
      - POSTGRES_PASSWORD=etlab123
      - POSTGRES_DB=etlab
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - etlab-network
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "pg_isready", "-U", "etlab"]
      interval: 10s
      timeout: 5s
      retries: 5

  airflow-postgres:
    image: postgres:15
    container_name: airflow-postgres
    environment:
      - POSTGRES_USER=airflow
      - POSTGRES_PASSWORD=airflow
      - POSTGRES_DB=airflow
    volumes:
      - airflow_postgres:/var/lib/postgresql/data
    networks:
      - etlab-network
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "pg_isready", "-U", "airflow"]
      interval: 10s
      timeout: 5s
      retries: 5

  airflow:
    image: apache/airflow:2.7.3-python3.11
    container_name: airflow
    entrypoint: /bin/bash
    command:
      - -c
      - |
        pip install --quiet 'apache-airflow-providers-apache-spark==4.1.5' 'pyspark==3.5.0' && \
        exec airflow standalone
    ports:
      - "8080:8080"
    environment:
      - AIRFLOW__CORE__EXECUTOR=LocalExecutor
      - AIRFLOW__CORE__LOAD_EXAMPLES=false
      - AIRFLOW__CORE__DAGS_ARE_PAUSED_AT_CREATION=false
      - AIRFLOW__DATABASE__SQL_ALCHEMY_CONN=postgresql+psycopg2://airflow:airflow@airflow-postgres/airflow
      - AIRFLOW__WEBSERVER__EXPOSE_CONFIG=true
      - AIRFLOW__API__AUTH_BACKENDS=airflow.api.auth.backend.basic_auth
      - AIRFLOW__SCHEDULER__DAG_DIR_LIST_INTERVAL=10
      - _AIRFLOW_DB_MIGRATE=true
      - _AIRFLOW_WWW_USER_CREATE=true
      - _AIRFLOW_WWW_USER_USERNAME=admin
      - _AIRFLOW_WWW_USER_PASSWORD=admin
    volumes:
      - airflow_dags:/opt/airflow/dags
      - airflow_logs:/opt/airflow/logs
    user: "50000:0"
    depends_on:
      airflow-postgres:
        condition: service_healthy
    networks:
      - etlab-network
    restart: unless-stopped

networks:
  etlab-network:
    driver: bridge

volumes:
  etlab_data:
  postgres_data:
  airflow_dags:
  airflow_logs:
  airflow_postgres:
```

```bash
docker-compose up -d
```

Access:
- **ETLab**: http://localhost
- **Airflow**: http://localhost:8080 (admin/admin)

### With External Database

```bash
# PostgreSQL
DATABASE_URL=postgresql+asyncpg://user:pass@host:5432/etlab \
docker run -d -p 80:80 --name etlab radhakrishnans/etlab:latest

# MySQL
DATABASE_URL=mysql+aiomysql://user:pass@host:3306/etlab \
docker run -d -p 80:80 --name etlab radhakrishnans/etlab:latest
```

### Docker Hub

Available tags:
- `radhakrishnans/etlab:latest` - Latest stable release
- `radhakrishnans/etlab:v1.0.0` - Version 1.0.0

### Kubernetes Deployment

```bash
# Quick deploy
kubectl run etlab --image=radhakrishnans/etlab:latest --port=80
kubectl expose pod etlab --port=80 --type=LoadBalancer

# Or use kubectl create deployment
kubectl create deployment etlab --image=radhakrishnans/etlab:latest
kubectl expose deployment etlab --port=80 --type=LoadBalancer

# Port forward for local access
kubectl port-forward svc/etlab 8080:80
```

Access at http://localhost:8080

For production deployments with PostgreSQL and persistent storage, see [docs/deployment/](docs/deployment/)

</details>

---

## Features

### Visual ETL Pipeline Builder
Drag, drop, connect. Watch PySpark code generate in real-time.

- **50+ data sources** — CSV, Parquet, Delta Lake, Snowflake, BigQuery, S3, Kafka, and more
- **80+ transformations** — Joins, aggregations, window functions, UDFs, Delta Lake operations
- **40+ pre-built templates** — Start instantly with production-ready patterns
- **Schema propagation** — Automatic column and type tracking through your pipeline
- **Live code preview** — See production-ready PySpark code as you build

### Airflow DAG Designer
Build orchestration workflows visually, export production-ready DAGs.

- **100+ operators** — AWS, GCP, Azure, Databricks, Snowflake, dbt, Kubernetes
- **12+ DAG templates** — Data pipelines, ML workflows, data quality, infrastructure
- **One-click sync** — Push DAGs directly to your Airflow instance
- **Schedule configuration** — Cron, presets, or manual triggers

### Execute Anywhere
Run your pipelines on any Spark environment.

| Mode | Use Case |
|------|----------|
| **Local** | Development & testing (built-in) |
| **Livy** | EMR, YARN, Kubernetes clusters |
| **Databricks** | Databricks workspaces |
| **Standalone** | Any Spark cluster |

### Built for Teams
- Multi-user workspaces with role-based access
- Share pipelines via secure links
- Auto-save — never lose your work

---

## Demo

Try it yourself:
```bash
docker run -d -p 80:80 --name etlab radhakrishnans/etlab:latest
```

---

## Documentation

| Topic | Link |
|-------|------|
| Installation | [Quick Start](#quick-start) |
| Configuration | [Environment Variables](#configuration) |
| Spark Connections | [Connecting to Clusters](#spark-connections) |
| Database Schema | [docs/DATABASE_SCHEMA.md](docs/DATABASE_SCHEMA.md) |
| Deployment Options | [docs/deployment/README.md](docs/deployment/README.md) |
| Sample Schemas | [docs/examples/sample_schemas.yaml](docs/examples/sample_schemas.yaml) |
| API Reference | [localhost/docs](http://localhost/docs) (when running) |
| Contributing | [CONTRIBUTING.md](CONTRIBUTING.md) |

### Examples

Check out the [examples folder](docs/examples/) for sample configurations:

- **[sample_schemas.yaml](docs/examples/sample_schemas.yaml)** — Define reusable data schemas for your pipelines

```yaml
# Example: Define a schema for your data sources
schemas:
  - name: customers
    source: parquet
    path: s3://data-lake/customers/
    columns:
      - name: customer_id
        dataType: long
        nullable: false
      - name: email
        dataType: string
        nullable: true
```

### Configuration

Create a `.env` file or pass environment variables:

```bash
# Required for production
JWT_SECRET_KEY=your-secret-key  # Generate with: openssl rand -base64 32

# Database (default: SQLite)
DATABASE_URL=postgresql+asyncpg://user:pass@localhost:5432/etlab

# Spark
SPARK_MASTER=local[*]           # or spark://host:7077
LIVY_URL=http://emr-master:8998 # for EMR/YARN

# Databricks (optional)
DATABRICKS_HOST=https://your-workspace.cloud.databricks.com
DATABRICKS_TOKEN=dapi-xxx
DATABRICKS_CLUSTER_ID=xxx
```

### Spark Connections

| Type | Configuration | Best For |
|------|---------------|----------|
| Local | `SPARK_MASTER=local[*]` | Development |
| Standalone | `SPARK_MASTER=spark://host:7077` | On-premise |
| Livy | `LIVY_URL=http://host:8998` | EMR, YARN, K8s |
| Databricks | Host + Token + Cluster ID | Databricks |

---

## Tech Stack

**Frontend**: React 19, TypeScript, Vite, React Flow, Zustand, Tailwind CSS, Monaco Editor

**Backend**: FastAPI, SQLAlchemy 2.0, Pydantic, PySpark 3.5

**Infrastructure**: Docker, Nginx, PostgreSQL/MySQL/SQLite, Apache Airflow

---

## Supported Nodes

<details>
<summary><strong>50+ Data Sources</strong></summary>

CSV, Parquet, JSON, ORC, Avro, Delta Lake, Iceberg, Hudi, JDBC, Snowflake, BigQuery, Redshift, MongoDB, Cassandra, Elasticsearch, Kafka, S3, Azure Data Lake, GCS, and more...

</details>

<details>
<summary><strong>80+ Transformations</strong></summary>

**Basic**: Select, Filter, Sort, Limit, Distinct, Union, Join

**Aggregations**: GroupBy, Pivot, Unpivot, Window Functions, Rollup, Cube

**Data Quality**: DropNA, FillNA, Deduplication, Outlier Detection, Type Fixing

**Performance**: Cache, Persist, Repartition, Coalesce, Broadcast Hints

**Advanced**: UDFs, Pandas UDFs, Explode, Flatten, Delta Lake Merge/Update/Delete

</details>

<details>
<summary><strong>40+ ETL Pipeline Templates</strong></summary>

**ETL Patterns**:
- CSV to Parquet, Database to Data Lake, JSON Flattening
- Basic Join, Filter & Aggregate, Incremental Load
- CDC Pipeline, SCD Type 2, Delta Lake Merge
- Bronze/Silver/Gold Layers, Full Medallion Architecture
- Retail Sales, Healthcare FHIR, Graph Data
- Cross-Region Replication, Data Mesh, Reverse ETL

**Streaming**:
- Kafka to Delta Lake, IoT Sensor Processing, Clickstream Analytics
- Streaming Aggregation, Windowed Analytics, Event Deduplication
- Multi-Stream Merge, Stream-Static Join, Event-Driven CDC

**Data Quality**:
- Schema Validation, Data Profiling, Deduplication
- PII Masking, Quarantine Bad Records, Audit Trail
- Silver Layer Cleansing, Financial Reconciliation

**Optimization**:
- ML Feature Store Pipeline

</details>

<details>
<summary><strong>12+ DAG Templates</strong></summary>

**Data Pipelines**:
- Medallion DAG (Bronze → Silver → Gold)
- ETL Orchestration with dependencies
- Incremental Load Pipeline
- dbt Pipeline with tests
- Multi-Source ETL

**ML Pipelines**:
- ML Model Training Pipeline
- Batch Inference Pipeline
- Feature Refresh Pipeline

**Data Quality**:
- Schema Validation DAG
- Great Expectations Pipeline
- Soda Data Quality Checks

**Infrastructure**:
- Databricks Job Orchestration
- S3 to GCS Sync
- Snowflake Maintenance

</details>

<details>
<summary><strong>100+ Airflow Operators</strong></summary>

**Core**: BashOperator, PythonOperator, Sensors, Triggers

**AWS**: S3, Lambda, Glue, EMR, Athena, Redshift, SageMaker, Step Functions

**GCP**: BigQuery, Dataflow, Dataproc, GCS, Pub/Sub, Cloud Functions

**Azure**: Data Factory, Synapse, Blob Storage, Data Lake, Cosmos DB

**Other**: Databricks, Snowflake, dbt, Kafka, Kubernetes, SSH/SFTP

</details>

---

## Contributing

Contributions are welcome! See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

```bash
# Development setup
git clone https://github.com/radha9887/etlab.git
cd etlab

# Frontend
cd frontend && npm install && npm run dev

# Backend
cd backend && pip install -r requirements.txt && uvicorn app.main:app --reload
```

---

## Roadmap

- [ ] Visual schema designer
- [ ] Pipeline versioning & git integration
- [ ] Scheduled execution
- [ ] Data lineage visualization
- [ ] Kubernetes Helm charts
- [ ] VS Code extension

---

## Author

**Radhakrishnan S**

[![GitHub](https://img.shields.io/badge/GitHub-radha9887-181717?logo=github)](https://github.com/radha9887)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-Radhakrishnan_S-0A66C2?logo=linkedin)](https://www.linkedin.com/in/radhakrishnan-s-15495930/)

---

## License

MIT License — see [LICENSE](LICENSE) for details.

---

<p align="center">
  <strong>If ETLab helps you, consider giving it a star!</strong><br/>
  <a href="https://github.com/radha9887/etlab">
    <img src="https://img.shields.io/github/stars/radha9887/etlab?style=social" alt="GitHub Stars">
  </a>
</p>

<p align="center">
  Built with ❤️ by <a href="https://github.com/radha9887">Radhakrishnan S</a> and <a href="https://claude.ai">Claude AI</a>
</p>
