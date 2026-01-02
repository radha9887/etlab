# Contributing to ETLab

Thank you for your interest in contributing to ETLab! This document provides guidelines and information for contributors.

## Code of Conduct

By participating in this project, you agree to maintain a respectful and inclusive environment for everyone.

## How to Contribute

### Reporting Bugs

Before creating a bug report, please check existing issues to avoid duplicates.

When reporting a bug, include:
- A clear, descriptive title
- Steps to reproduce the issue
- Expected vs actual behavior
- Screenshots if applicable
- Environment details (OS, browser, Docker version)

### Suggesting Features

Feature requests are welcome! Please provide:
- A clear description of the feature
- The problem it solves
- Potential implementation approach (optional)

### Pull Requests

1. **Fork** the repository
2. **Clone** your fork locally
3. **Create a branch** for your changes:
   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b fix/your-bug-fix
   ```
4. **Make your changes** following the coding guidelines
5. **Test your changes** thoroughly
6. **Commit** with a clear message:
   ```bash
   git commit -m "Add feature: brief description"
   ```
7. **Push** to your fork:
   ```bash
   git push origin feature/your-feature-name
   ```
8. **Open a Pull Request** against the `main` branch

## Development Setup

### Prerequisites
- Node.js 18+
- Python 3.11+
- Docker (optional, for containerized development)

### Frontend Development

```bash
cd frontend
npm install
npm run dev
```

### Backend Development

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
pip install -r requirements-dev.txt  # Development dependencies
uvicorn app.main:app --reload
```

### Running Tests

```bash
# Frontend tests
cd frontend
npm test
npm run test:coverage

# Backend tests
cd backend
pytest
pytest --cov=app  # With coverage
```

## Coding Guidelines

### Frontend (TypeScript/React)

- Use TypeScript for all new code
- Follow existing component patterns
- Use functional components with hooks
- Keep components focused and reusable
- Add proper TypeScript types/interfaces
- Use Zustand for global state management

### Backend (Python/FastAPI)

- Follow PEP 8 style guidelines
- Use type hints for function signatures
- Write async code where appropriate
- Add docstrings for public functions
- Use Pydantic models for validation

### General Guidelines

- Write clear, self-documenting code
- Add comments only when logic isn't obvious
- Keep functions small and focused
- Avoid premature optimization
- Write tests for new features

## Project Structure

### Frontend Components

Components are organized by feature:
- `Canvas/` - Visual flow designer
- `PropertiesPanel/` - Node configuration panels
- `DagCanvas/` - Airflow DAG designer
- `DagPropertiesPanel/` - DAG operator configs
- `CodeEditor/` - Monaco editor integration

### Adding a New Transform Node

1. Add the node type to `frontend/src/types/index.ts`
2. Create config component in `frontend/src/components/PropertiesPanel/configs/`
3. Add code generation logic in `frontend/src/utils/pyspark/transforms/`
4. Update the sidebar in `frontend/src/components/Sidebar/`

### Adding a New Airflow Operator

1. Add operator type to types
2. Create config component in `frontend/src/components/DagPropertiesPanel/configs/`
3. Add imports in `frontend/src/utils/airflow/imports/`
4. Add operator code generation in `frontend/src/utils/airflow/operators/`

### Backend API Endpoints

- Add routes in `backend/app/routers/`
- Add Pydantic schemas in `backend/app/schemas/`
- Add database models in `backend/app/models/`
- Add business logic in `backend/app/services/`

## Commit Message Format

Use clear, descriptive commit messages:

```
<type>: <short description>

[optional body with more details]
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

Examples:
```
feat: add Snowflake source connector
fix: resolve join column duplication issue
docs: update README with Docker instructions
```

## Testing Requirements

- All new features should include tests
- Bug fixes should include regression tests
- Maintain or improve code coverage
- Ensure all existing tests pass

## Documentation

- Update README.md for user-facing changes
- Add inline documentation for complex logic
- Update API documentation for endpoint changes
- Include examples where helpful

## Review Process

1. All PRs require at least one review
2. Address reviewer feedback promptly
3. Keep PRs focused and reasonably sized
4. Ensure CI checks pass before review

## Questions?

Feel free to open an issue for questions or discussions about potential contributions.

Thank you for contributing to ETLab!
