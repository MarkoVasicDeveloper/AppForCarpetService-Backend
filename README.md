# AppForCarpetService Backend

A modular REST API for managing carpet-cleaning service operations, including customers, carpet receptions, carpets, workers, scheduling, suppliers, income, costs, subscribers, analytics, and authentication.

The application is built with **NestJS**, **TypeScript**, **TypeORM**, and **MySQL**. It uses a multi-role security model for administrators, users, and workers, with DTO validation, JWT authentication, refresh-token rotation, ownership-based data access, structured HTTP errors, Swagger documentation, event-driven notifications, and automated unit tests.

## Core Capabilities

| Capability | Description |
|---|---|
| Authentication | Login and refresh-token flows for administrators, users, and workers. |
| Authorization | JWT authentication, role-based access control, and owner-scoped data access. |
| User management | User registration, profile operations, account verification, and administrator controls. |
| Administrator management | Administrator CRUD operations, credential changes, and token invalidation. |
| Worker management | Worker creation, updates, lookup, ownership checks, and worker-specific authentication. |
| Carpet operations | Carpet dimensions, pricing, calculated surface area, payment values, workers, and delivery dates. |
| Carpet reception | Reception records, delivery status, client relationships, and operational queries. |
| Scheduling | Scheduled carpet records with owner-scoped update and deletion operations. |
| Financial management | Income and cost categories, entries, suppliers, and ownership-aware queries. |
| Analytics | Daily, weekly, monthly, yearly, and detailed operational reports. |
| Subscribers and notifications | Subscriber management and event-driven email notifications using Handlebars templates and SMTP. |
| API documentation | Swagger/OpenAPI documentation exposed by the application. |

## Technology Stack

| Area | Technology |
|---|---|
| Runtime | Node.js |
| Framework | [NestJS](https://nestjs.com/) |
| Language | TypeScript |
| Database | MySQL / MariaDB-compatible database |
| ORM | [TypeORM](https://typeorm.io/) |
| Authentication | Passport, JWT, bcrypt |
| Validation | class-validator and class-transformer |
| API documentation | @nestjs/swagger |
| Events | @nestjs/event-emitter |
| Email | Nodemailer, SMTP, Handlebars |
| Testing | Jest and @nestjs/testing |
| HTTP server | Express through @nestjs/platform-express |

## Architecture

The application uses NestJS modular architecture. Each business area is isolated into a module containing its controller, service, DTOs, and database entity definitions where applicable.

### Application layers

- **Controllers** expose HTTP endpoints, parse route parameters, apply decorators and guards, and delegate operations to services.
- **Services** contain business rules, ownership checks, persistence operations, and domain-specific error handling.
- **DTOs** define and validate incoming request data before it reaches application logic.
- **Entities** define TypeORM mappings and relationships with the MySQL schema.
- **Shared infrastructure** provides authentication guards, role decorators, request metadata extraction, response transformation, exception formatting, and cryptographic utilities.

### Authentication architecture

Authentication is designed around a provider-based abstraction. `AuthService` iterates over registered authentication providers through `IAuthenticatableService`, allowing administrator, user, and worker identities to participate in the same login flow without embedding all identity lookup logic directly in the authentication service.

Passwords are protected using asynchronous bcrypt hashing and comparison. Successful authentication produces a short-lived access token and a longer-lived refresh token. Refresh tokens are persisted by role and rotated when used.

Refresh-token persistence is centralized in `RefreshTokenService`. A role registry maps each supported role to its token repository and identifier fields, reducing duplicated token-management code while retaining separate token entities for administrators, users, and workers.

### Authorization and data isolation

The application uses a global JWT guard and a role checker guard. Routes declare access requirements with `@Roles(...)`, while public routes explicitly use `@Public()`.

Owner identity is extracted from the authenticated request through `@CurrentOwnerId()`. Services then include the owner identifier in repository queries so that users and workers cannot access records belonging to another account.

### Event-driven side effects

Credential changes and account deletion publish domain events. The authentication event listener reacts to these events and invalidates affected refresh tokens through the centralized token service. Notification-related behavior is separated into the notification module, keeping infrastructure side effects outside the primary domain operation.

## Repository Structure

```text
AppForCarpetService-Backend/
├── app.module.ts                         # Root module and infrastructure wiring
├── main.ts                               # Application bootstrap and global framework setup
├── ormconfig.js                          # TypeORM CLI/runtime configuration
├── src/
│   ├── modules/
│   │   ├── administrator/                # Administrator management
│   │   ├── analysis/                     # Operational and financial reporting
│   │   ├── auth/                         # Authentication, JWT, providers, tokens, events
│   │   ├── carpet/                       # Carpet records and calculated financial values
│   │   ├── carpet-receptions/            # Carpet reception workflow
│   │   ├── clients/                      # Client CRUD and search
│   │   ├── cost/                         # Cost categories and entries
│   │   ├── income/                       # Income categories and entries
│   │   ├── notification/                 # SMTP notifications and templates
│   │   ├── scheduling-carpet/             # Scheduling operations
│   │   ├── subscribers/                  # Subscriber management
│   │   ├── suppliers/                    # Supplier management
│   │   ├── user/                         # User registration and account operations
│   │   └── worker/                       # Worker management and authentication
│   └── shared/
│       ├── decorators/                   # Public, role, owner, and request metadata decorators
│       ├── enums/                        # Shared role definitions
│       ├── filters/                      # Global exception formatting
│       ├── guards/                       # JWT and role authorization
│       ├── interceptors/                 # Standard response transformation
│       ├── response/                     # Shared API response types
│       └── utils/                        # Shared cryptographic utilities
├── package.json
└── package-lock.json
```

## Prerequisites

- Node.js 18 or newer.
- npm 9 or newer.
- MySQL or MariaDB.
- SMTP credentials if email notifications are required.

## Configuration

Create a `.env` file in the project root:

```dotenv
NODE_ENV=development
JWT_SECRET=replace-with-a-long-random-secret

DB_HOST=127.0.0.1
DB_PORT=3306
DB_USERNAME=your_database_user
DB_PASSWORD=your_database_password
DB_NAME=apiperionica

SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your_smtp_user
SMTP_PASS=your_smtp_password
SMTP_FROM="Carpet Service" <noreply@example.com>
```

Never commit real credentials. Use environment-level configuration or a secret manager in deployed environments.

## Installation

```bash
git clone https://github.com/MarkoVasicDeveloper/AppForCarpetService-Backend.git
cd AppForCarpetService-Backend
npm ci
```

The committed lockfile is intended to provide reproducible installations. If npm reports a peer-dependency conflict, resolve the package-version mismatch in `package.json` rather than making `--legacy-peer-deps` part of the normal production workflow.

## Running the Application

```bash
# Standard start
npm run start

# Development watch mode
npm run start:dev

# Production build and start
npm run build
npm run start:prod
```

The application currently listens on port `8080`, as configured in `main.ts`.

## Swagger API Documentation

Swagger documentation is available at:

```text
http://localhost:8080/api/docs
```

The generated document is titled **Carpet Cleaning Service API** and includes bearer authentication support for protected endpoints.

## API Areas

| Route group | Purpose |
|---|---|
| `/auth` | Login, refresh, and administrator token invalidation. |
| `/users` | Registration, verification, profile management, and administrator user operations. |
| `/administrators` | Administrator CRUD and username search. |
| `/workers` | Worker CRUD, worker lookup, and worker authentication. |
| `/clients` | Client CRUD and search. |
| `/carpets` | Carpet lookup and carpet creation/update operations. |
| `/carpet-receptions` | Reception creation, editing, status queries, and client-based queries. |
| `/scheduling-carpets` | Scheduling creation, updates, listing, and deletion. |
| `/incomes` | Income categories and entries. |
| `/costs` | Cost categories and entries. |
| `/suppliers` | Supplier management. |
| `/subscribers` | Subscriber management and subscriber-related retrieval. |
| `/analysis` | Operational and financial analysis reports. |

Use Swagger as the authoritative interactive reference for request bodies, parameters, authentication, and response models as the API evolves.

## Validation and Error Handling

All incoming requests pass through a global `ValidationPipe` configured with `whitelist: true`, `forbidNonWhitelisted: true`, and `transform: true`. This rejects unexpected request properties and enables DTO transformation.

The global exception filter returns a consistent `ApiResponse` structure and logs unhandled server exceptions. Controllers and services use NestJS HTTP exceptions such as `UnauthorizedException`, `ForbiddenException`, `NotFoundException`, `BadRequestException`, and `ConflictException`.

Successful responses are normalized by the global transform interceptor. Sensitive entity fields, including password hashes, are excluded from serialized output through class-transformer metadata.

## Testing

Run the test suite once:

```bash
npm test -- --runInBand
```

Run tests in watch mode:

```bash
npm run test:watch
```

Generate coverage output:

```bash
npm run test:cov
```

The repository currently contains 14 specification files and 138 test cases covering authentication, refresh-token behavior, administrators, users, workers, clients, carpets, receptions, scheduling, income, costs, suppliers, subscribers, notification behavior, and analysis orchestration.

The suite is primarily service-level. Before production release, complement it with end-to-end tests for global guards, role metadata, validation pipes, Swagger-documented endpoints, ownership boundaries, and database integration.

## Code Quality Commands

```bash
# Format source files
npm run format

# Run linting
npm run lint

# Build the application
npm run build
```

Recommended local verification sequence:

```bash
npm ci
npm run lint
npm test -- --runInBand
npm run build
```

## Production Considerations

Before deploying this service to production:

1. Disable TypeORM `synchronize` in production and manage schema changes through reviewed migrations.
2. Move database logging and other development-oriented settings behind environment-specific configuration.
3. Require `JWT_SECRET` and database credentials at startup instead of relying on fallback values.
4. Restrict CORS to known frontend origins rather than enabling unrestricted CORS.
5. Add CI checks for clean dependency installation, linting, tests, and builds.
6. Add end-to-end and database integration coverage for security-critical routes.
7. Add rate limiting and monitoring around login and refresh-token endpoints.
8. Ensure notification templates are copied into the compiled output during deployment.
9. Use structured logging and centralized secret management in deployed environments.
10. Document database initialization, migration, backup, and rollback procedures.

## Engineering Principles

The codebase is organized around separation of concerns, single responsibility, reusable abstractions, defense in depth, consistent failure behavior, and testable business logic. New identity providers can implement the authentication contract without rewriting core login orchestration, while domain services remain isolated from HTTP concerns.

## License

The repository currently declares the project as private and uses an `UNLICENSED` package license. Treat the source as proprietary unless the distribution terms are explicitly changed by the project owner.

## Author

**Marko Vasic**

- GitHub: [MarkoVasicDeveloper](https://github.com/MarkoVasicDeveloper)
- Repository: [AppForCarpetService-Backend](https://github.com/MarkoVasicDeveloper/AppForCarpetService-Backend)

## References

[1]: https://github.com/MarkoVasicDeveloper/AppForCarpetService-Backend "AppForCarpetService-Backend repository"
[2]: https://nestjs.com/ "NestJS official website"
[3]: https://typeorm.io/ "TypeORM official documentation"
[4]: https://jestjs.io/ "Jest official documentation"
[5]: https://docs.nestjs.com/openapi/introduction "NestJS OpenAPI documentation"
