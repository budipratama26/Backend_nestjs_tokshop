# TokShop Backend API

[![CI](https://github.com/budipratama26/Backend_nestjs_tokshop/actions/workflows/ci.yml/badge.svg)](https://github.com/budipratama26/Backend_nestjs_tokshop/actions/workflows/ci.yml)

TokShop is an e-commerce RESTful API built with **NestJS**, **TypeORM**, and **SQLite/PostgreSQL/MySQL**. Designed as a backend engineering portfolio project showcasing solid backend fundamentals: modular architecture, Role-Based Access Control (RBAC), ACID database transactions, concurrent stock management, production security hardening, observability, and comprehensive automated testing.

---

## 🛠️ Tech Stack & Key Architecture

- **Runtime & Framework:** Node.js (v22+), TypeScript (ES Modules), NestJS 12
- **Database & Flexible ORM:** TypeORM supporting SQLite (`better-sqlite3`), PostgreSQL, and MySQL (Migrations & Seeder)
- **Transactions & Concurrency:** ACID Database Transactions via `DataSource.transaction` for atomic checkout and race-condition-safe stock locking
- **Authentication & Security Hardening:**
  - Stateless JWT authentication with custom `AuthGuard` & `bcrypt` password hashing
  - **Refresh Token Rotation** with reuse detection (automatic session revocation on token theft)
  - **Token Blacklisting** (database-based) for immediate access token invalidation on logout/account deletion
  - **Account Lockout** after 5 failed login attempts (15-minute lockout window)
  - **Password Complexity Enforcement** (minimum 8 chars with uppercase, lowercase, and digit)
  - Role-Based Access Control (`RolesGuard`) supporting `admin`, `seller`, and `customer`
  - Rate Limiting via `@nestjs/throttler` (Global & sensitive endpoint throttling against brute-force)
  - HTTP Security Headers via `helmet`
  - Magic Byte inspection for file uploads (JPEG, PNG, WebP) to prevent MIME-type spoofing
  - Input Sanitization & DTO constraints (`class-validator`) preventing XSS tags, oversized payloads, and prototype pollution
  - Query parameter whitelisting for safe dynamic SQL sorting
  - Strict IDOR (Insecure Direct Object Reference) protection on order invoices with format regex validation
- **Audit Logging:** Database-backed audit trail tracking login, logout, registration, account deletion, product creation/deletion, and order creation with admin query endpoint
- **Scheduled Tasks:** Automatic cleanup of expired blacklisted tokens via `@nestjs/schedule` cron jobs
- **Observability & Health Checks:**
  - High-performance structured logging via `pino-http` / `nestjs-pino` (`pino-pretty` in development)
  - Structured error logging via NestJS `Logger` in exception filters (no sensitive data leakage)
  - APM & Telemetry integration via `@nestjs/observe`
  - Health check probe via `@nestjs/terminus` (`/health`)
- **Testing:** Unit tests and E2E integration tests powered by **Vitest** and **Supertest**
- **Documentation:** Interactive OpenAPI Swagger UI (`/api`)
- **CI Pipeline:** GitHub Actions automated linting (`oxlint`), unit testing, E2E testing, and production build checks

---

## 📂 Project Structure

```text
src/
├── auth/            # JWT authentication, refresh token rotation, token blacklist, and roles guard
├── common/          # Audit logging, global exception filters, and response transform interceptors
├── migrations/      # TypeORM database migration files
├── orders/          # Checkout transactions, order history, and invoice lookups
├── products/        # Catalog browsing, search pagination, and secure image upload
├── users/           # User registration, profile management, and admin user list
├── app.module.ts    # Root application module with Joi environment validation
├── health.controller.ts # Health check endpoint (/health)
└── main.ts          # Application bootstrap, URI versioning, Helmet, CORS, and Swagger setup
test/
└── app.e2e-spec.ts  # Comprehensive end-to-end integration test suite
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js:** v22+ or v24+
- **npm:** v10+

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/budipratama26/Backend_nestjs_tokshop.git
cd Backend_nestjs_tokshop
npm install
```

### 2. Environment Setup
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Configure environment variables:
```env
# Application Settings
PORT=3000
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000,http://localhost:5173

# Security & Authentication
JWT_SECRET=your_super_secret_jwt_key_here

# Database Seeder (Password for demo accounts: Admin, Seller, Customer)
SEED_PASSWORD=password123

# Database Configuration (Default: better-sqlite3)
DB_TYPE=better-sqlite3
DB_DATABASE=database.sqlite

# External Database Settings (Optional: switch DB_TYPE to postgres or mysql)
# DB_HOST=localhost
# DB_PORT=5432
# DB_USERNAME=postgres
# DB_PASSWORD=your_password

# APM & Observability (Optional)
OBSERVE_APP_KEY=your_observe_app_key
APP_SECRET=your_observe_app_secret
```

### 3. Run Database Migrations
Build and apply database schema migrations:
```bash
npx tsx ./node_modules/typeorm/cli.js migration:run -d data-source.ts
```

### 4. Database Seeding (Demo Data)
Populate demo user accounts and sample products:
```bash
# Seed initial data (Admin, Seller, Customer, and sample products)
npm run seed

# Rollback / clear seeded data
npm run seed:clear
```

**Pre-configured Demo Accounts:**
- **Admin:** `admin@tokshop.com` | Password: `password123`
- **Seller:** `seller@tokshop.com` | Password: `password123`
- **Customer:** `customer@tokshop.com` | Password: `password123`

> **Note:** Seed accounts bypass API validation (written directly to DB). New registrations via API require passwords with at least 1 uppercase letter, 1 lowercase letter, and 1 digit.

### 5. Running the Application
```bash
# Development mode (watch with pretty logger)
npm run start:dev

# Production build and run
npm run build
npm run start:prod
```

Server runs on: `http://localhost:3000`  
Swagger UI docs: `http://localhost:3000/api`  
Health check probe: `http://localhost:3000/health`

---

## 📌 API Endpoints (v1)

All business endpoints are versioned with the `/v1/` URI prefix.

### Authentication & Users
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `POST` | `/v1/auth/login` | Authenticate and receive access + refresh tokens (Rate limited: 5 req/min) | Public |
| `POST` | `/v1/auth/refresh` | Refresh access token using refresh token (with rotation) | Public |
| `POST` | `/v1/auth/logout` | Logout and revoke refresh + access tokens | Authenticated |
| `POST` | `/v1/users` | Register a new customer account | Public |
| `GET` | `/v1/users/me` | View authenticated user profile | Authenticated |
| `PATCH` | `/v1/users/me` | Update authenticated user profile name | Authenticated |
| `DELETE` | `/v1/users/me` | Soft-delete own account (revokes all sessions) | Authenticated |
| `GET` | `/v1/users` | List all registered users | Admin Only |
| `GET` | `/v1/users/:id` | View user profile details by ID | Admin Only |

### Products
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `GET` | `/v1/products` | Browse product catalog (search, safe sort, pagination) | Public |
| `GET` | `/v1/products/:id` | View detailed product information | Public |
| `POST` | `/v1/products` | Create a new product listing | Seller Only |
| `PATCH` | `/v1/products/:id` | Update product details | Product Owner |
| `DELETE` | `/v1/products/:id` | Soft-delete product listing | Product Owner |
| `POST` | `/v1/products/:id/image` | Upload product image (Magic byte validated) | Product Owner |
| `PATCH` | `/v1/products/:id/restore` | Restore soft-deleted product listing | Product Owner |

### Orders & Checkout
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `POST` | `/v1/orders` | Checkout product with atomic stock decrement | Authenticated |
| `GET` | `/v1/orders/my-orders` | View user purchase history | Authenticated |
| `GET` | `/v1/orders/:orderNumber` | View order invoice details (IDOR protected) | Order Owner |

> **Note on Payment Flow:** Payment processing is simulated for portfolio demonstration. Successful checkout automatically generates an invoice with `PAID` status inside an atomic database transaction.

### Admin
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `GET` | `/v1/admin/audit-logs` | View audit log history (filterable by action, userId, pagination) | Admin Only |

### System Health & Monitoring
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `GET` | `/health` | System and database connectivity health probe | Public |

---

## 🔐 Security Features

| Feature | Description |
|---|---|
| **Refresh Token Rotation** | Short-lived access tokens (15min) + long-lived refresh tokens (7 days) with automatic reuse detection |
| **Token Blacklisting** | Immediate invalidation of access tokens on logout/account deletion |
| **Account Lockout** | 5 failed login attempts → 15-minute account lock |
| **Password Complexity** | Minimum 8 characters with uppercase, lowercase, and digit |
| **Audit Logging** | All security-sensitive actions logged to database with admin query endpoint |
| **Rate Limiting** | Global throttle (10 req/min) + login-specific throttle (5 req/min) |
| **Timing Attack Mitigation** | Constant-time bcrypt comparison even for non-existent users |
| **IDOR Protection** | Ownership validation on all resource access |

---

## 🧪 Testing

Testing is implemented with **Vitest** and **Supertest** covering unit logic and end-to-end user workflows:

- **Unit Tests (21 tests across 5 suites):** Validates individual services, guards, and security boundaries (`RolesGuard`, `AuthService`, `ProductsService`, `OrdersService`, and `AppController`).
- **E2E Integration Tests (11 tests):** Validates complete API lifecycles (`test/app.e2e-spec.ts`) covering user registration, JWT login, credential verification, rate limit responses, public catalog queries, RBAC access denials, atomic checkout transactions, IDOR invoice access control, and post-deletion token invalidation.

```bash
# Run unit tests
npm run test

# Run E2E integration tests
npm run test:e2e

# Run tests with coverage report
npm run test:cov

# Run linter
npm run lint
```

---

## 🐳 Docker Deployment

Build and run using containerization:

```bash
# Build multi-stage image
docker build -t tokshop-api .

# Run container
docker run -p 3000:3000 --env-file .env tokshop-api
```

---

## 📝 License

Distributed under the [MIT License](LICENSE).
