import { knex as setupKnex, Knex } from 'knex'
import { env } from './env'

let connection : any = env.DATABASE_URL

if (env.DATABASE_CLIENT === "sqlite") {
  connection = {
    filename: env.DATABASE_URL,
  }
}

export const config: Knex.Config = {
  client: env.DATABASE_CLIENT,
  connection: connection,
  useNullAsDefault: true,
  migrations: {
    extension: 'ts',
    directory: './db/migrations'
  }
}

export const knex = setupKnex(config)
