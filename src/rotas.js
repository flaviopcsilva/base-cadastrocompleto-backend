const express = require('express')
const { listarClientes, cadastrarCliente, confirmarCadastro, buscarCPF } = require('./controladores/clientes')
const rotas = express()

rotas.get('/', (req, res) => {
    return res.json('Rota Funcionando')
})

rotas.get('/clientes', listarClientes)
rotas.post('/clientes', cadastrarCliente)
rotas.post('/cadastro', confirmarCadastro)

rotas.get('/buscarcpf', buscarCPF)

module.exports = rotas