const express = require('express')
const { listarClientes, cadastrarCliente, confirmarCadastro, buscarCPF, excluirCliente } = require('./controladores/clientes')
const { LogInstance } = require('twilio/lib/rest/serverless/v1/service/environment/log')
const crialogin = require('./controladores/login')
const verificarToken = require('./intermeriarios/verificaLogin')
const rotas = express()

rotas.get('/', (req, res) => {
    return res.json('Rota Funcionando')
})

rotas.post('/login', crialogin)
rotas.post('/clientes', cadastrarCliente)
rotas.post('/cadastro', confirmarCadastro)

// rotas.use(verificarToken)
rotas.get('/clientes', listarClientes)

rotas.delete('/clientes', excluirCliente)

rotas.get('/buscarcpf', buscarCPF)

module.exports = rotas