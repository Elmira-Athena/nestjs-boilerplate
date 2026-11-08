# NestJS boilerplate

<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="200" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

<p align="center">NestJS Boilerplate</p>

## Prerequisites

- [Node.js](https://nodejs.org/en) v16+
- [PostgreSQL](https://www.postgresql.org/)

## Installation

```bash
# install packages
$ npm install

# init database
$ docker compose up -d init_db
```

If you encounter the error related to `argon2` then uncomment the following command in `docker-compose.yml` file

```yaml
command: sh -c "npm rebuild argon2 --build-from-source && npm run typeorm:run-migration && npm run seed:run"
```

## Migration

```bash
# run migrations
$ npm run typeorm:run-migrations

# generate migrations
$ npm run typeorm:generate-migration --name=migration-name
```

If script above doesn't work, try using `git bash`, change `$npm_config_name` in package.json to `%name%` and run the following script:

```bash
$ name=migration-name npm run typeorm:generate-migration
```

## Seeding

### Creating seeds

1. Create seed file with the following command:

```bash
# `Demo` is name of entity.
$ npm run seed:create -- --name=Demo
```

1. Go to `src/database/typeorm/seeds/demo/demo-seed.service.ts`.
2. In `run` method extend your logic.

### Run seed

```bash
$ npm run seed:run
```

## Generate module, controller & service

With `$npm_config_name` in `package.json`

```bash
# Generate module
$ npm run module:generate --name=module-name

# Generate controller
$ npm run controller:generate --name=controller-name

# Generate service
$ npm run service:generate --name=service-name
```

With `%name%` in `package.json`

```bash
# Generate module
$ name=demo npm run module:generate

# Generate controller
$ name=demo npm run controller:generate

# Generate service
$ name=demo npm run service:generate
```

Module, controller & service of Demo will be created in `src/modules/demo`

## Gen entity from database

1. Change the desired database name in the `gen-entity-local` script in `package.json`

```json
"gen-entity-local": "npx typeorm-model-generator -h localhost -d <YOUR-DATABASE-NAME> -u postgres -x postgres -e postgres -o src/database/typeorm/generated  --skipTables=migrations,spatial_ref_sys --noConfig --cf=none --namingStrategy=./src/config/namingStrategy",
```

2. Run the following command

```bash
$ npm run gen-entity-local
```

The new entities can be found at `src/database/typeorm/generated` folder

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Test

```bash
# unit tests
$ npm run test

# unit tests in watch mode
$ npm run test:watch

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```
