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

3. **Set up the database**:
   - Ensure you have Docker and Docker Compose installed.
   - Run the following command to start the PostgreSQL database:
     ```bash
     docker-compose up -d
     ```

4. **Run the application**:
   ```bash
   npm run start:dev
   ```

The API will be available at `http://localhost:3000`.

## API Documentation

Vicky API includes comprehensive documentation generated with Swagger. To access the documentation, run the application and navigate to `http://localhost:3000/api`.

The documentation provides a detailed overview of all available endpoints, including:

- **Authentication**:
  - `POST /auth/register`: Register a new user.
  - `POST /auth/login`: Log in and receive a JWT.

- **Experiences**:
  - `GET /experiences`: Get all experiences for the authenticated user.
  - `POST /experiences`: Create a new experience.
  - `GET /experiences/:id`: Get a specific experience by ID.
  - `PATCH /experiences/:id`: Update an experience.
  - `DELETE /experiences/:id`: Delete an experience.

- **Topics**:
  - `GET /topics/experience/:experienceId`: Get all topics for a specific experience.
  - `POST /topics`: Create a new topic for an experience.
  - `GET /topics/:id`: Get a specific topic by ID.
  - `PATCH /topics/:id`: Update a topic.
  - `DELETE /topics/:id`: Delete a topic.

The Swagger UI allows you to interact with the API directly from your browser, making it easy to test and explore the available functionality.
