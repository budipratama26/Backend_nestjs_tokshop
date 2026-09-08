# TokShop Backend API

A production-ready e-commerce RESTful API built with **NestJS**, **TypeORM**, and **SQLite**. Designed with strict security practices, role-based access control (RBAC), database migrations, and containerization.

---

## 🛠 Tech Stack & Architecture

- **Framework:** NestJS (Node.js & TypeScript, ES Modules)
- **Database & ORM:** SQLite (`better-sqlite3`) + TypeORM
- **Authentication:** JWT (JSON Web Token) + `bcrypt` password hashing
- **Authorization:** Role-Based Access Control (RBAC) with custom `@Roles()` decorator and `RolesGuard` (Admin, Seller, Customer)
- **Validation:** `class-validator` & `class-transformer` (DTO whitelisting) + `Joi` schema validation for `.env` fail-fast startup
- **Security:** `helmet` headers, CORS enabled, `@nestjs/throttler` (Rate limiting), Anti-IDOR ownership verification
- **Logging:** Structured logging using `nestjs-pino` & `pino-pretty`
- **File Handling:** Secure file upload using `Multer` with extension & size validation
- **Documentation:** Swagger OpenAPI (`/api`)
- **API Versioning:** URI Versioning (`/v1/...`)
- **Containerization:** Multi-stage `Dockerfile` (Node 22 Alpine)
- **Test Runner:** `vitest` + `@nestjs/testing`

---

## 📂 Project Structure

```text
src/
├── auth/            # Authentication, JWT strategy, login, and roles guard
├── common/          # Global filters, interceptors, and custom decorators
├── migrations/      # TypeORM database migration files
├── orders/          # Order management and transaction processing
├── products/        # Product CRUD, upload interceptors, search & filter
├── users/           # User registration and profile management
├── app.module.ts    # Root application module with security & logging imports
└── main.ts          # Application bootstrap with versioning, helmet, and swagger
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

Configure your environment variables in `.env`:
```env
PORT=3000
NODE_ENV=development
JWT_SECRET=your_super_secret_jwt_key_here
```
> **Note:** Application uses fail-fast startup validation with Joi. It will refuse to boot if `JWT_SECRET` is missing.

### 3. Database Migration
Run the existing migrations to build the SQLite schema:
```bash
npx tsx ./node_modules/typeorm/cli.js migration:run -d data-source.ts
```

### 4. Running the App

```bash
# Development mode (watch)
npm run start:dev

# Production build & run
npm run build
npm run start:prod
```

API will be running on `http://localhost:3000`.

---

## 🐳 Running with Docker

You can build and run the application inside a multi-stage Docker container:

```bash
# Build image
docker build -t tokshop-api .

# Run container
docker run -p 3000:3000 --env-file .env tokshop-api
```

---

## 📖 API Documentation (Swagger)

Interactive Swagger documentation is available at:
```text
http://localhost:3000/api
```

---

## 📌 Key API Endpoints (v1)

All endpoints are prefixed with `/v1/`.

| Method | Endpoint | Description | Access |
|---|---|---|---|
| `POST` | `/v1/auth/login` | Login and receive JWT access token | Public |
| `POST` | `/v1/users` | Register a new user (`customer` / `seller`) | Public |
| `GET` | `/v1/users/:id` | Get user profile | Authenticated |
| `GET` | `/v1/products` | Get products (with pagination, sort, search) | Public |
| `GET` | `/v1/products/:id` | Get product detail | Public |
| `POST` | `/v1/products` | Create product (supports image upload) | Seller Only |
| `PATCH` | `/v1/products/:id` | Update product (Anti-IDOR protected) | Owner Seller |
| `DELETE` | `/v1/products/:id` | Soft delete product | Owner Seller |
| `POST` | `/v1/orders` | Create an order | Authenticated |
| `GET` | `/v1/orders` | List user orders | Authenticated |

---

## 🧪 Testing

Unit tests are written using `vitest` and `@nestjs/testing`:

```bash
# Run unit tests
npm run test

# Run tests with coverage report
npm run test:cov
```

---

## 📝 License

Distributed under the [MIT License](LICENSE).
