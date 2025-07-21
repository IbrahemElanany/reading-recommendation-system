# 📚 Reading Recommendation System

A robust, production-ready RESTful API built with [NestJS](https://nestjs.com/) for tracking reading progress, managing books, and providing personalized book recommendations. Designed for extensibility, security, and performance, this system leverages modern backend technologies and best practices.

---

## 🚀 Features

- **User Authentication & Authorization**
  - Secure JWT-based authentication
  - Role-based access control (Admin/User)
  - Rate limiting per endpoint and globally

- **Book Management**
  - CRUD operations for books
  - Page tracking and metadata management

- **Reading Progress Tracking**
  - Log reading intervals with start/end pages
  - Retrieve and analyze reading history

- **Personalized Recommendations**
  - Get top books based on user and global reading data
  - Insights into reading habits

- **Background Processing**
  - Asynchronous calculation of read pages using BullMQ + Redis

- **Caching Strategy**
  - Global Redis cache via `@nestjs/cache-manager`
  - Fine-grained cache for top books and user stats
  - Automatic cache invalidation on data changes
  - Admin endpoints for cache stats and manual clearing

- **API Documentation**
  - Interactive Swagger UI at `/api/docs`
  - Enhanced with custom decorators, detailed DTO schemas, and real-world examples
  - Standardized responses and error handling

- **Security & Validation**
  - Input validation with DTOs and custom validators
  - CORS enabled
  - Global exception handling
  - Throttling and brute-force protection

- **Logging & Monitoring**
  - Centralized, structured logging with Winston
  - Error and access logs, with support for external monitoring

---

## 🛠️ Tech Stack

| Layer         | Technology                |
| ------------- | ------------------------ |
| Framework     | [NestJS](https://nestjs.com/) (Node.js) |
| Auth          | JWT, Passport             |
| Database      | PostgreSQL, Prisma ORM    |
| Queue/Cache   | Redis, BullMQ, cache-manager |
| Docs          | Swagger/OpenAPI           |
| Container     | Docker, Docker Compose    |
| Package Mgmt  | npm                      |
| Testing       | Jest (unit & e2e)         |
| Logging       | Winston                   |

---

## 📦 Project Structure

```
src/
  ├── auth/         # Authentication & user management
  ├── books/        # Book CRUD, reading intervals, recommendations
  ├── common/       # Shared utilities, guards, interceptors, filters
  ├── logger/       # Centralized logging
  ├── prisma/       # Database integration
  └── main.ts       # Application entry point
prisma/
  └── schema.prisma # Database schema
```

---

## ⚡ Quick Start

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd reading-recommendation-system
```

### 2. Environment Setup

Copy the example environment file (if present):

```bash
cp .env.example .env
```

> For Docker Compose, environment variables are pre-configured in `docker-compose.yml`.

### 3. Start the Application

```bash
# Build and run all services
docker-compose up --build

# Or run in detached mode
docker-compose up --build -d
```

### 4. Access the API

- **Swagger UI:** [http://localhost:3000/api/docs](http://localhost:3000/api/docs)
- **Base URL:** `http://localhost:3000/api/v1/`

---

## 🧩 Architecture & Best Practices

- **Modular Design:** Each domain (auth, books, etc.) is encapsulated in its own module for maintainability and scalability.
- **Prisma ORM:** Type-safe, performant database access with migrations and schema management.
- **Global Middleware:**
  - ValidationPipe for DTO validation and transformation
  - ResponseInterceptor for standardized API responses
  - AllExceptionsFilter for consistent error handling
  - ThrottleGuard for rate limiting (per route and global)
- **Role-Based Access:** Decorators and guards restrict sensitive endpoints to admins or users as appropriate.
- **Background Jobs:** BullMQ queues for heavy/async tasks (e.g., analytics, read page calculations)
- **Logging:** Winston-based, with console and file transports, and support for external log aggregation.

---

## 🧠 Caching Strategy

- **Global Redis Cache:**
  - Configured via `@nestjs/cache-manager` and `cache-manager-ioredis`.
  - Used for rate limiting, top books, and user stats.
  - TTL and max cache size are configurable via environment variables.
- **Fine-Grained Caching:**
  - Top books results are cached per limit (e.g., `top_books:5`)
  - User-specific stats can be cached for performance
- **Cache Invalidation:**
  - On reading interval changes, related cache entries are invalidated (pattern-based for Redis, fallback for in-memory)
  - Admin endpoints allow manual cache clearing and stats retrieval
- **Monitoring:**
  - Cache stats endpoint for admins: `/api/v1/books/cache/stats`
  - Manual cache clear endpoint: `/api/v1/books/cache/clear`

---

## 📝 Swagger Documentation Enhancements

- **Custom Decorators:**
  - All endpoints are annotated with detailed Swagger decorators (see `src/auth/decorators/swagger/`, `src/books/decorators/swagger/`)
  - Realistic request/response examples for every endpoint
  - Error responses and validation errors are documented with examples
- **DTO Integration:**
  - All DTOs use `@ApiProperty` and `@ApiPropertyOptional` for schema generation
  - Enum values, formats, and constraints are visible in the docs
- **Security:**
  - JWT Bearer authentication is documented and required for protected endpoints
- **Standardized Responses:**
  - All responses are wrapped in a consistent format (see `ResponseInterceptor`)
  - Error responses are standardized via `AllExceptionsFilter`
- **Access:**
  - Swagger UI available at `/api/docs` (default port 3000)

---

## 🔒 Security & Validation

- **Rate Limiting:**
  - Per-route and global, using Redis-backed cache
  - Configurable via environment variables
- **Input Validation:**
  - DTOs with `class-validator` and custom constraints
  - Automatic transformation and whitelisting
- **Exception Handling:**
  - Global filter for all HTTP and system errors
- **Role Guards:**
  - Restrict access to sensitive endpoints (e.g., book creation, cache management)
- **CORS:**
  - Enabled by default for safe cross-origin requests

---

## 🧪 Testing

Run tests locally:

```bash
# Unit tests
npm run test

# End-to-end tests
npm run test:e2e

# Test coverage
npm run test:cov
```

---

## 🏗️ Extensibility & Improvements

- **Repository Pattern:**
  - Base repository provided for Prisma, can be extended for complex data access
- **Microservices:**
  - Job processing can be offloaded to dedicated workers
- **Monitoring:**
  - Integrate Prometheus & Grafana for metrics and dashboards
- **Cloud Native:**
  - Ready for container orchestration (Kubernetes, etc.)
- **Managed Services:**
  - Compatible with AWS RDS, ElastiCache, Azure equivalents

---

## 📖 Documentation

- **API Reference:** [http://localhost:3000/api/docs](http://localhost:3000/api/docs)
- **Codebase:** Well-structured, modular, and documented for easy onboarding

---

## 🤝 Contributing

Contributions are welcome! Please open issues or submit pull requests for improvements and bug fixes.

---

## 📝 License

This project is licensed under the MIT License.

---

**For questions or support, please contact the maintainer.**
