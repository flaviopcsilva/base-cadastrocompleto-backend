
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const knex = require('../conexoes/database')


const hash = process.env.SENHA_JWT

const crialogin = async (req, res) => {
    const { email, senha } = req.body
    if (!email || !senha) {
        return res.status(400).json({ mensagem: 'Os Campos não podem ficar em branco.' })
    }
    try {
        const usuarios = await knex('clientes').where({ email }).first()

        if (!usuarios) {
            return res.status(401).json({ mensagem: 'Email ou senha inválida' })
        }

        const senhaCorreta = await bcrypt.compare(senha, usuarios.senha)

        if (!senhaCorreta) {
            return res.status(401).json({ mensagem: 'Email ou senha inválida' })
        }

        const token = jwt.sign({ id: usuarios.id }, process.env.SENHA_JWT, { expiresIn: '5m' })

        const { senha: _, ...dadosUsuario } = usuarios

        return res.status(201).json({
            usuario: dadosUsuario,
            token
        })
    } catch (error) {
        console.log(error.message);
        return res.status(500).json({ mensagem: ` Erro interno do servidor ${error.message}` })
    }
}

module.exports = crialogin