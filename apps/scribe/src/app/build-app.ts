import { Knex } from 'knex'
import {
  fastifyContainerPlugin,
  fastifyKnexPlugin,
  fastifyTransactionPlugin,
} from '@algomart/shared/plugins'
import { DependencyResolver } from '@algomart/shared/utils'
import ajvCompiler from '@fastify/ajv-compiler'
import ajvFormats from 'ajv-formats'
import fastify, { FastifyServerOptions } from 'fastify'
import { fastifySchedule } from 'fastify-schedule'
import fastifySensible from 'fastify-sensible'
import { generateHealthRoutes } from '@algomart/shared/modules'
import { webhookRoutes } from '../modules/webhooks'

export interface AppConfig {
  knexMain: Knex.Config
  fastify?: FastifyServerOptions
  container: DependencyResolver
}

export default async function buildApp(config: AppConfig) {
  const app = fastify(
    Object.assign({}, config.fastify, {
      // https://www.nearform.com/blog/upgrading-fastifys-input-validation-to-ajv-version-8/
      // https://www.fastify.io/docs/latest/Server/#schemacontroller
      schemaController: {
        compilersFactory: {
          buildValidator: ajvCompiler(),
        },
      },

      ajv: {
        customOptions: {
          removeAdditional: true,
          useDefaults: true,
          allErrors: true,
          validateFormats: true,
          // Need to coerce single-item arrays to proper arrays
          coerceTypes: 'array',
          // New as of Ajv v7, strict schema is not compatible with TypeBox
          // The alternative is to wrap EVERYTHING with Type.Strict(...)
          strictSchema: false,
        },
        plugins: [ajvFormats],
      },
    })
  )

  // Plugins
  await app.register(fastifySchedule)
  await app.register(fastifySensible)

  // Our Plugins
  await app.register(fastifyContainerPlugin, { container: config.container })
  await app.register(fastifyTransactionPlugin)

  // Our Plugins
  await app.register(fastifyKnexPlugin, {
    knex: config.knexMain,
    name: 'knexMain',
  })

  // Decorators
  // no decorators yet

  // Hooks
  // no hooks yet

  // Services
  await app.register(generateHealthRoutes(), { prefix: '/health' })
  await app.register(webhookRoutes, { prefix: '/webhooks' })

  return app
}