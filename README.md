<p align="center">A NestJS base project with structured environment configuration.</p>

# NestJS Boilerplate

## Description

A boilerplate for NestJS applications with best practices and structured setup.

## Project Setup

```bash
# Install dependencies
$ npm install
```

## Compile and Run the Project

```bash
# Start in development mode
$ npm run start:dev

# Start with debugging enabled
$ npm run start:debug
```

## Run Tests

```bash
# Run unit tests
$ npm run test

# Run test coverage
$ npm run test:cov
```

## Linting and Formatting

```bash
# Check and fix linting issues
$ npm run lint --fix
```

## Deployment

```bash
# Build the project
$ npm run build

# Start in production mode
$ npm run start:prod
```

## Environment Configuration

The project uses **YAML-based configuration** to manage different environments and external services.

#### Environment Files

- **\`config/default.yaml\`** → Contains default configuration for development.
- **\`config/custom-environment-variables.yaml\`** → Maps environment variables dynamically.
- **\`config/services/\`** → Contains configurations for **microservices and third-party services**.

## Code Quality

```bash
# Run ESLint to check code style
$ npm run lint

# Fix linting errors automatically
$ npm run lint --fix

# Run Prettier to format code
$ npm run format
```

The project uses Jest for testing and mongodb-memory-server for an in-memory database.

## Project Structure

nestjs-base/
│── src/
│ ├── modules/ # Feature modules
│ ├── shared/ # Shared utilities/helpers
│ ├── main.ts # Entry point
│── config/
│ ├── services/ # Microservices & third-party service configurations
│ ├── custom-environment-variables.yaml # Env mapping
│ ├── default.yaml # Default environment settings
│── package.json # Project dependencies & scripts
│── README.md # Project documentation

## Author

**toantv**
Contact: [tatoanhn02@gmail.com](mailto:tatoanhn02@gmail.com)
GitHub: [tatoanhn02](https://github.com/tatoanhn02)
