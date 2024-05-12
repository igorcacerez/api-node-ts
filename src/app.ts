import fastify from 'fastify'
import { transactionsRoutes } from './routes/transactions'
import fastifyCookie from '@fastify/cookie'

export const app = fastify()

app.register(fastifyCookie)

// Um middleware global para todas as rotas
app.addHook("preHandler", async (req) => {
  console.log(`${req.method} ${req.url}`)
})

// Rotas de transactions 
app.register(transactionsRoutes, {
  prefix: "transactions"
})
