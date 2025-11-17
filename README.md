# Vicky API

Vicky API is a professional backend service designed to manage and showcase a user's professional curriculum, including their experiences, skills, and educational background. The API is built with Node.js and the NestJS framework, providing a robust and scalable solution for creating and managing a digital resume.

## Business Logic

The core business logic of Vicky API revolves around the concept of a digital curriculum. Users can register and log in to the system to manage their professional information, which is organized into two main categories:

- **Experiences**: These represent the user's professional background, including work experience, education, volunteer work, certifications, and personal projects. Each experience has a defined category and can include details such as the position, company, dates, and location.

- **Topics**: These are specific skills, technologies, or knowledge areas associated with each experience. For example, a "Senior Developer" experience might have topics like "React.js," "Node.js," and "TypeScript." This allows for a detailed and granular representation of a user's capabilities.

## Application Flow

The application flow is designed to be intuitive and straightforward, allowing users to easily manage their curriculum:

1. **Authentication**: Users begin by registering a new account or logging in with their existing credentials. The API uses JWT (JSON Web Tokens) for authentication, ensuring that all subsequent requests are secure and associated with the correct user.

2. **Experience Management**: Once authenticated, users can create, view, update, and delete their professional experiences. Each experience is linked to the user's account, ensuring that they can only access and modify their own information.

3. **Topic Management**: For each experience, users can add, view, update, and delete topics. This allows them to provide a detailed breakdown of the skills and technologies they used in each role or project.

4. **Data Retrieval**: The API provides endpoints to retrieve all experiences and topics for a user, as well as to fetch specific items by their ID. This makes it easy to display the curriculum information in a frontend application.

## Technologies Used

Vicky API is built with a modern and robust technology stack, including:

- **[Node.js](https://nodejs.org/)**: A JavaScript runtime for building fast and scalable server-side applications.
- **[NestJS](https://nestjs.com/)**: A progressive Node.js framework for building efficient, reliable, and scalable server-side applications.
- **[TypeScript](https://www.typescriptlang.org/)**: A typed superset of JavaScript that enhances code quality and developer productivity.
- **[PostgreSQL](https://www.postgresql.org/)**: A powerful, open-source object-relational database system.
- **[TypeORM](https://typeorm.io/)**: A TypeScript ORM (Object-Relational Mapper) for working with databases.
- **[Docker](https://www.docker.com/)**: A platform for developing, shipping, and running applications in containers.
- **[Swagger](https://swagger.io/)**: A tool for designing, building, documenting, and consuming RESTful APIs.

## Setup and Installation

To run Vicky API locally, follow these steps:

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-username/vicky-api.git
   cd vicky-api
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure environment variables**:
   - Copy the example environment file:
     ```bash
     cp .env.example .env
     ```
   - Edit `.env` and configure the following variables:
     - **Database (PostgreSQL)**: `DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD`, `DB_DATABASE`
     - **Redis**: `REDIS_HOST`, `REDIS_PORT`
     - **OpenAI API**: `OPENAI_API_KEY` (required for embeddings and LLM features)
     - **Application**: `PORT` (optional, defaults to 3000), `NODE_ENV`

4. **Set up the database and Redis**:
   - Ensure you have Docker and Docker Compose installed.
   - Run the following command to start PostgreSQL (with pgvector) and Redis:
     ```bash
     docker-compose up -d
     ```
   - Initialize pgvector extension in the database:
     ```bash
     docker exec -i vicky-postgres-database psql -U vicky -d vicky_db < database/init-extensions.sql
     ```

5. **Run the application**:
   ```bash
   npm run start:dev
   ```

The API will be available at `http://localhost:3000`.

## Environment Variables

The application uses the following environment variables (see `.env.example` for reference):

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `PORT` | Application port | `3000` | No |
| `NODE_ENV` | Environment mode | `development` | No |
| `DB_HOST` | PostgreSQL host | `localhost` | No |
| `DB_PORT` | PostgreSQL port | `5432` | No |
| `DB_USERNAME` | PostgreSQL username | `vicky` | No |
| `DB_PASSWORD` | PostgreSQL password | `vicky123` | No |
| `DB_DATABASE` | PostgreSQL database name | `vicky_db` | No |
| `REDIS_HOST` | Redis host | `localhost` | No |
| `REDIS_PORT` | Redis port | `6379` | No |
| `OPENAI_API_KEY` | OpenAI API key for embeddings and LLM | - | **Yes** |
| `JWT_SECRET` | JWT secret for token signing | `your-secret-key` | No (change in production!) |
| `JWT_EXPIRES_IN` | JWT token expiration time | `1d` | No |

### Production Deployment

For production deployments, set these environment variables in your hosting platform:

- **Docker/Container platforms**: Use environment variables or `.env` file mounted as secret
- **Cloud platforms** (AWS, GCP, Azure): Use their respective secret management services
- **Platform-as-a-Service** (Heroku, Railway, etc.): Set via their dashboard or CLI

Example for Docker Compose in production:
```yaml
services:
  app:
    environment:
      - DB_HOST=${DB_HOST}
      - DB_PORT=${DB_PORT}
      - DB_USERNAME=${DB_USERNAME}
      - DB_PASSWORD=${DB_PASSWORD}
      - DB_DATABASE=${DB_DATABASE}
      - REDIS_HOST=${REDIS_HOST}
      - REDIS_PORT=${REDIS_PORT}
      - OPENAI_API_KEY=${OPENAI_API_KEY}
      - JWT_SECRET=${JWT_SECRET}
      - JWT_EXPIRES_IN=${JWT_EXPIRES_IN}
    env_file:
      - .env.production
```

Example for Kubernetes ConfigMap/Secret:
```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: vicky-api-config
data:
  DB_HOST: "your-db-host"
  DB_PORT: "5432"
  DB_DATABASE: "vicky_db"
  REDIS_HOST: "your-redis-host"
  REDIS_PORT: "6379"
---
apiVersion: v1
kind: Secret
metadata:
  name: vicky-api-secrets
type: Opaque
stringData:
  DB_USERNAME: "your-db-username"
  DB_PASSWORD: "your-db-password"
  OPENAI_API_KEY: "your-openai-api-key"
  JWT_SECRET: "your-jwt-secret"
```

## API Documentation

Vicky API includes comprehensive documentation generated with Swagger. To access the documentation, run the application and navigate to `http://localhost:3000/api`.

The documentation provides a detailed overview of all available endpoints

The Swagger UI allows you to interact with the API directly from your browser, making it easy to test and explore the available functionality.

*MIT © 2025 Arthur Araujo*