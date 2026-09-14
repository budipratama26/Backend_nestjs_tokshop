# TokShop Backend API

[![CI](https://github.com/budipratama26/Backend_nestjs_tokshop/actions/workflows/ci.yml/badge.svg)](https://github.com/budipratama26/Backend_nestjs_tokshop/actions/workflows/ci.yml)

TokShop is an e-commerce RESTful API built with **NestJS**, **TypeORM**, and **SQLite**. Designed as a backend engineering portfolio project showcasing solid backend fundamentals: modular architecture, Role-Based Access Control (RBAC), ACID database transactions, concurrent stock management, and comprehensive testing.

---

## 🛠️ Tech Stack & Key Architecture

- **Runtime & Framework:** Node.js, TypeScript (ES Modules), NestJS
- **Database & ORM:** SQLite (`better-sqlite3`) with TypeORM (Migrations & Seeder)
- **Transactions:** ACID Database Transactions via `DataSource.transaction` for atomic checkout and stock locking
- **Authentication & Security:** Stateless JWT, `bcrypt` password hashing, and custom `AuthGuard`
- **Authorization:** Role-Based Access Control (`RolesGuard`) supporting `admin`, `seller`, and `customer`
- **Validation:** `class-validator` & `class-transformer` with strict DTO whitelisting
- **File Storage:** Local multipart file upload with MIME type and extension whitelisting
- **Testing:** Unit tests and E2E integration tests powered by **Vitest** and Supertest
- **Documentation:** Interactive OpenAPI Swagger UI (`/api`)
- **CI Pipeline:** GitHub Actions automated linting, unit testing, and production build checks

---

## 📂 Project Structure

```text
src/
├── auth/            # JWT authentication, login service, and roles guard
├── common/          # Global exception filters and response transform interceptors
├── migrations/      # TypeORM database migration files
├── orders/          # Checkout transactions, order history, and invoice lookups
├── products/        # Catalog browsing, search pagination, and image upload
├── users/           # User registration, profile management, and admin user list
├── app.module.ts    # Root application module
└── main.ts          # Application bootstrap, URI versioning, and Swagger setup
test/
└── app.e2e-spec.ts  # End-to-end integration test suite
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
PORT=3000
NODE_ENV=development
JWT_SECRET=your_super_secret_jwt_key_here
```

### 3. Run Database Migrations
Build the SQLite database schema:
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

### 5. Running the Application
```bash
# Development mode (watch)
npm run start:dev

# Production build and run
npm run build
npm run start:prod
```

Server runs on: `http://localhost:3000`  
Swagger UI docs: `http://localhost:3000/api`

---

## 📌 API Endpoints (v1)

All endpoints are versioned with the `/v1/` URI prefix.

### Authentication & Users
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `POST` | `/v1/auth/login` | Authenticate user and receive JWT token | Public |
| `POST` | `/v1/users` | Register a new customer account | Public |
| `GET` | `/v1/users/me` | View authenticated user profile | Authenticated |
| `PATCH` | `/v1/users/me` | Update authenticated user profile name | Authenticated |
| `DELETE` | `/v1/users/me` | Soft-delete own account | Authenticated |
| `GET` | `/v1/users` | List all registered users | Admin Only |
| `GET` | `/v1/users/:id` | View user profile details by ID | Admin Only |

### Products
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `GET` | `/v1/products` | Browse product catalog (search, sort, pagination) | Public |
| `GET` | `/v1/products/:id` | View detailed product information | Public |
| `POST` | `/v1/products` | Create a new product listing | Seller Only |
| `PATCH` | `/v1/products/:id` | Update product details | Product Owner |
| `DELETE` | `/v1/products/:id` | Soft-delete product listing | Product Owner |
| `POST` | `/v1/products/:id/image` | Upload product display image | Product Owner |
| `PATCH` | `/v1/products/:id/restore` | Restore soft-deleted product listing | Product Owner |

### Orders & Checkout
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `POST` | `/v1/orders` | Checkout product with atomic stock decrement | Authenticated |
| `GET` | `/v1/orders/my-orders` | View user purchase history | Authenticated |
| `GET` | `/v1/orders/:orderNumber` | View order invoice details | Order Owner |

> **Note on Payment Flow:** Payment processing is simulated for portfolio demonstration. Successful checkout automatically generates an invoice with `PAID` status inside an atomic database transaction.

### System Health
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `GET` | `/health` | System and SQLite connectivity health check probe | Public |

---

## 🧪 Testing

Testing is implemented with **Vitest** and **Supertest** covering both unit logic and end-to-end user workflows:

- **Unit Tests (18 tests):** Validates individual services and guards (`RolesGuard`, `AuthService`, `ProductsService`, `OrdersService`, and `AppController`).
- **E2E Integration Tests (6 tests):** Validates complete API lifecycles (`test/app.e2e-spec.ts`) covering user registration, JWT login, credential verification, public catalog queries, unauthorized request handling, and checkout transactions.

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
