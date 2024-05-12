import { test, beforeAll, afterAll, expect, beforeEach } from 'vitest'
import { execSync } from 'node:child_process'
import { app } from '../src/app'
import request from 'supertest'
import { describe } from 'node:test'

/**
 * Execulta os testes apenas quando o server estiver pronto
 * pois eles são async então caso não use isso o teste pode 
 * execultar antes que a rota esteja pronta. 
 */
beforeAll(async () => {
    await app.ready()
})

/**
 * Fecha a aplicação quando encerrar todos os testes
 */
afterAll(async () => {
    await app.close()
})

/**
 * Essa função é executada antes de cada um dos testes
 */
beforeEach(async () => {
    execSync('npm run knex migrate:rollback --all') // Apaga todo o banco
    execSync('npm run knex migrate:latest') // Cria o banco novamente
})

describe('Rotas de transacao', () => {

    test('O usuario consegue criar uma transacao', async () => {
        await request(app.server)
            .post("/transactions")
            .send({
                title: "Nova Tansacao",
                amount: 3000,
                type: 'credit'
            })
            .expect(201)
    })

    test("Listar as transação do usuario", async () => {
        const createTransactionResponse = await request(app.server)
            .post("/transactions")
            .send({
                title: "Nova Tansacao",
                amount: 3000,
                type: 'credit'
            })

        const cookies: string = String(createTransactionResponse.get("Set-Cookie"))

        const listaTransactions = await request(app.server)
            .get("/transactions")
            .set('Cookie', cookies)
            .expect(200)

        expect(listaTransactions.body.transactions)
            .toEqual([
                expect.objectContaining({
                    id: expect.any(String),
                    title: "Nova Tansacao",
                    amount: 3000
                })
            ])

    })

    test("Listar um transação expecifica", async () => {
        const createTransactionResponse = await request(app.server)
            .post("/transactions")
            .send({
                title: "Nova Tansacao",
                amount: 3000,
                type: 'credit'
            })

        const cookies: string = String(createTransactionResponse.get("Set-Cookie"))

        const listaTransactions = await request(app.server)
            .get("/transactions")
            .set('Cookie', cookies)

        const transactionId : string = listaTransactions.body.transactions[0].id

        const getTransactionId = await request(app.server)
            .get(`/transactions/${transactionId}`)
            .set('Cookie', cookies)
            .expect(200)

        expect(getTransactionId.body.transaction)
            .toEqual(
                expect.objectContaining({
                    id: transactionId
                })
            )

    })


    test("Listar o resumo das transações do usuário", async () => {
        const createTransactionResponse = await request(app.server)
            .post("/transactions")
            .send({
                title: "Nova Tansacao",
                amount: 3000,
                type: 'credit'
            })

        const cookies: string = String(createTransactionResponse.get("Set-Cookie"))

        await request(app.server)
            .post("/transactions")
            .set('Cookie', cookies)
            .send({
                title: "Nova Tansacao 2",
                amount: 2500,
                type: 'credit'
            })

        await request(app.server)
            .post("/transactions")
            .set('Cookie', cookies)
            .send({
                title: "Nova Tansacao 3",
                amount: 1000,
                type: 'debit'
            })

        const getSummaryTransactions = await request(app.server)
            .get("/transactions/summary")
            .set('Cookie', cookies)
            .expect(200)

        expect(getSummaryTransactions.body.summary)
            .toEqual(
                expect.objectContaining({
                    amount: 4500
                })
            )

    })

    test.todo("TODO é para lembrar que vc tem que  fazer esse teste")
})