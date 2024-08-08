require('dotenv').config()
const express = require('express')
const rotas = require('./rotas')
const app = express()

app.use(express.json())

app.use(rotas)

app.listen(process.env.PORT_SERVER, () => {
    console.log(`Servidor Rodando na Porta ${process.env.PORT_SERVER}`)
})