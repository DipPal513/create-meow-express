# MEOW CLI 🐱

### The Ultimate Express.js Project Generator

**MEOW CLI** is a powerful, interactive command-line tool designed to jumpstart your Express.js backend development. It automates the boilerplate process, setting up folder structures, database connections, authentication, and Docker configurations in seconds.

---

## Features

* **Language Choice:** Support for both **TypeScript** and **JavaScript** (ES6+).
* **Database Integration:** Out-of-the-box configuration for **MongoDB** (Mongoose) or **PostgreSQL** (pg-pool).
* **Built-in Auth:** Optional JWT + Bcrypt implementation including registration and login logic.
* **Containerization:** Automated **Dockerfile** and `.dockerignore` generation.
* **Package Manager Agnostic:** Works with `npm`, `yarn`, `pnpm`, or `bun`.
* **Security Ready:** Pre-configured with `helmet` and `cors`.

---

## Project Structure

Depending on your selections, MEOW CLI generates a clean, modular architecture:

```text
my-express-app/
├── src/
│   ├── config/             # Database connection logic
│   ├── controllers/        # Route handlers (Auth, etc.)
│   ├── routes/             # API route definitions
│   └── index.ts            # Entry point & Middleware setup
├── .env                    # Environment variables
├── Dockerfile              # Container configuration
├── package.json            # Scripts and dependencies
└── tsconfig.json           # TypeScript configuration (if selected)

```

---

## Usage Guide

### 1. Installation

Ensure you have **Node.js** installed. You can run the CLI directly using `npx` or by linking it locally.

```bash
# To run directly if published
npx create-meow-cli

```

### 2. Configuration Options

When you run the command, you will be prompted with the following questions:

| Prompt | Options | Description |
| --- | --- | --- |
| **Project Name** | String | Name of the directory to be created. |
| **Language** | TypeScript, JavaScript | Sets up `.ts` or `.js` files and compilers. |
| **Database** | MongoDB, PostgreSQL, None | Generates the relevant connection pool/client. |
| **Authentication** | Yes/No | Adds JWT, Bcrypt, and Auth controllers. |
| **Dockerfile** | Yes/No | Generates a production-ready Docker image config. |
| **Package Manager** | npm, bun, pnpm, yarn | Installs dependencies using your preferred tool. |

### 3. Scripts

The generated project comes with pre-defined scripts in `package.json`:

* `dev`: Starts the server with **nodemon** for auto-reloading.
* `build`: Compiles TypeScript to JavaScript (if applicable).
* `start`: Runs the compiled code from the `dist` folder.

---

##  Security & Environment

The tool automatically creates a `.env` file with default placeholders.

> [!IMPORTANT]
> **Always** update the `JWT_SECRET` and database credentials in your `.env` file before deploying to production.

---

## Dependencies Included

MEOW CLI bundles industry-standard libraries to ensure your app is production-ready:

* **Express**: Fast, unopinionated web framework.
* **Dotenv**: Loads environment variables.
* **Cors**: Enables Cross-Origin Resource Sharing.
* **Helmet**: Secures Express apps by setting various HTTP headers.
* **Bcryptjs**: Optimized password hashing.
* **JSONWebToken**: Secure transmission of information as a JSON object.

---

## Next Steps

Once the generation is complete, navigate to your folder and start building:

```bash
cd your-project-name
npm run dev

```

**Would you like me to help you add a specific feature to this CLI, such as an automated Testing Suite (Jest) or an API documentation generator (Swagger)?**
