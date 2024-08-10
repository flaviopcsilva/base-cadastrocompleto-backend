const knex = require("../conexoes/database")
const axios = require('axios')
const buscarEnderecoPorCep = require("../services/cep")
const { formatarCPF, formatarTelefone, formatarCEP } = require("../services/formatacoes")
const { validarCPF } = require("../services/cpfvalidador")
const moment = require('moment')
const bcrypt = require('bcrypt')
const { enviarEmailConfirmacao, gerarCodigoConfirmacao, enviarSMSConfirmacao } = require("../services/codigo-de-confirmacao")
const { cadastradoComSucesso, confirmacaoDeCadastroCliente } = require("../services/envioDeEmails")
const handlebars = require('handlebars')
const transporteEmail = require("../conexoes/email")
const { corpoConfirmacaoCadastro, corpoDoEmail } = require("../html/compilador")
const { response } = require("../rotas")


const listarClientes = async (req, res) => {
    const clientes = await knex('clientes')

    return res.status(200).json(clientes)
}

const cadastrarCliente = async (req, res) => {
    const { cep, nome, senha, email, cpf, data_de_nascimento, numero, complemento, telefone } = req.body
    if (!cep || !nome || !email || !cpf || !data_de_nascimento || !numero || !complemento || !telefone || !senha) {
        return res.status(400).json({ Mensagem: 'Campos não pode ficar em Branco' })
    }

    // Validar formato do CPF
    if (!validarCPF(cpf)) {
        return res.status(404).json({ error: 'CPF inválido.' });
    }

    // Formatar data de nascimento para o formato correto
    const dataNascimentoFormatada = moment(data_de_nascimento, 'DD/MM/YYYY').format('YYYY-MM-DD');
    // Formatar CPF, telefone e CEP usando as arrow functions
    const cpfFormatado = formatarCPF(cpf)
    const telefoneFormatado = formatarTelefone(telefone)
    const cepFormatado = formatarCEP(cep)



    try {

        const senhaCriptografada = await bcrypt.hash(senha, 10)

        const emailExiste = await knex('clientes')
            .where({ email })
            .first()

        if (emailExiste) {
            return res.status(400).json({ Mensagem: 'Email já cadastrado!' })
        }

        const cpfExiste = await knex('clientes')
            .where({ cpf: cpfFormatado })
            .first()
        if (cpfExiste) {
            return res.status(400).json({ Mensagem: 'CPF já cadastrado!' })
        }


        const endereco = await buscarEnderecoPorCep(cep)
        // Se o CEP foi encontrado, inclui as informações de endereço
        const { logradouro, bairro, localidade, uf } = endereco;

        const codigoConfirmacao = gerarCodigoConfirmacao();
        console.log(nome);

        // Armazene temporariamente o código de confirmação e os dados do cliente
        await knex('confirmacoes').insert({
            email,
            codigo: codigoConfirmacao,
            nome,
            cep: cepFormatado,
            numero,
            cpf: cpfFormatado,
            data_nascimento: dataNascimentoFormatada,
            telefone: telefoneFormatado,
            rua: logradouro,
            bairro,
            cidade: localidade,
            estado: uf,
            complemento,
            senha: senhaCriptografada// Supondo que a senha seja armazenada com segurança (hashing)
        });

        // Enviar SMS de confirmação
        // await enviarSMSConfirmacao(telefoneFormatado, codigoConfirmacao);
        //enviar email de confirmação
        const variaveisEmail = {
            cliente: nome,
            codigo: codigoConfirmacao
        }

        const template = handlebars.compile(corpoConfirmacaoCadastro)

        const corpoDoEmailRenderizado = template(variaveisEmail)

        confirmacaoDeCadastroCliente(email, corpoDoEmailRenderizado);

        return res.status(200).json({ Mensagem: 'Código de confirmação enviado para o email.' });



    } catch (error) {
        return res.status(500).json({ Mensagem: `Erro na rota de Cadastro de Clientes: ${error.message}` })
    }

}

const confirmarCadastro = async (req, res) => {
    const { email, codigo } = req.body;

    if (!email || !codigo) {
        return res.status(400).json({ Mensagem: 'Campos não pode ficar em branco!' })
    }

    try {
        const confirmacao = await knex('confirmacoes').where({ email, codigo }).first();

        if (!confirmacao) {
            return res.status(400).json({ Mensagem: 'Código de confirmação ou email inválido.' });
        }

        // Movendo dados para a tabela de clientes
        const clienteId = await knex('clientes').insert({
            nome: confirmacao.nome,
            cep: confirmacao.cep,
            numero: confirmacao.numero,
            email: confirmacao.email,
            cpf: confirmacao.cpf,
            data_nascimento: confirmacao.data_nascimento,
            telefone: confirmacao.telefone,
            rua: confirmacao.rua,
            bairro: confirmacao.bairro,
            cidade: confirmacao.cidade,
            estado: confirmacao.estado,
            complemento: confirmacao.complemento,
            senha: confirmacao.senha
        }).returning('*');

        // Remova o registro de confirmação após a validação
        await knex('confirmacoes').where({ email }).del();

        const { senha: _, ...clientenovo } = clienteId[0]

        const variaveisEmail = {
            cliente: confirmacao.nome,

        }
        const template = handlebars.compile(corpoDoEmail)

        const corpoDoEmailRenderizado = template(variaveisEmail)


        // const enviarEmail = await transporteEmail.sendMail({
        //     from: process.env.EMAIL_USER,
        //     to: confirmacao.email,
        //     subject: 'Cadastro Realizado',
        //     html: corpoDoEmailRenderizado
        // })

        cadastradoComSucesso(email, corpoDoEmailRenderizado)

        return res.status(201).json({ Mensagem: 'Cadastro confirmado com sucesso.', clientenovo });
    } catch (error) {
        return res.status(500).json({ Mensagem: `Erro na confirmação do cadastro: ${error.message}` });
    }
};

const excluirCliente = async (req, res) => {
    const { email } = req.body

    try {

        if (!email) {
            return res.status(400).json({ mensagem: 'Campo email não pode ser em branco!' })
        }
        const clienteExiste = await knex('clientes')
            .where({ email: email })
            .first()

        if (!clienteExiste) {
            return res.status(404).json({ mensagem: 'Cliente não existe!' })
        }

        const resultadoExclusao = await knex('clientes')
            .where({ email: email })
            .del()

        // Verifique se a exclusão foi bem-sucedida (resultadoExclusao > 0)
        if (resultadoExclusao > 0) {
            return res.status(200).json({ Mensagem: `Cliente ${clienteExiste.nome} foi excluido.` });
        } else {
            return res.status(500).json({ Mensagem: 'Erro ao excluir o cliente' });
        }

    } catch (error) {
        return res.status(500).json({ mensagem: `Erro interno do servidor na rota de exclusão: ${error.message}` })
    }
}

const buscarCPF = async (req, res) => {
    const { cpf, dataNascimento } = req.body;

    if (!cpf) {
        return res.status(400).json({ message: 'CPF é obrigatório' });
    }

    try {

        // const config = {
        //     method: 'get',
        //     maxBodyLength: Infinity,
        //     // url: `https://ws.hubdodesenvolvedor.com.br/v2/cpf/?{{tipo_do_retorno}}&cpf=${cpf}&data=${dataNascimento}&token=${process.env.HUBDEV_API_KEY}`,
        //     url: `https://ws.hubdodesenvolvedor.com.br/v2/cpf/?{{tipo_do_retorno}}&cpf=${cpf}&data=${dataNascimento}&token=${process.env.HUBDEV_API_KEY}`,
        //     headers: {}
        // };

        // axios(config)
        //     .then(function (response) {
        //         console.log(JSON.stringify(response.data));

        //     })

        // const dadosPessoais = response.data

        // const dados = {
        //     nome: dadosPessoais.result.nome_da_pf,
        //     dataDeNascimento: dadosPessoais.result.data_nascimento,
        //     situacao: dadosPessoais.result.situacao_cadastral
        // }

        const resposta = await axios.get(`https://ws.hubdodesenvolvedor.com.br/v2/cpf/?{{tipo_do_retorno}}&cpf=${cpf}&data=${dataNascimento}&token=${process.env.HUBDEV_API_KEY}`,
            {
                headers: {}
            }
        )

        const dadosPessoais = resposta.data
        console.log(dadosPessoais);
        console.log(dadosPessoais.status);
        if (!dadosPessoais.status) {
            console.log('verdadeiro 1');
            if (dadosPessoais.message === 'Data Nascimento invalida.') {
                console.log('verdadeiro2');
                return res.status(400).json({ Mensagem: 'Data de Nascimento Inválida.' });
            }
            if (dadosPessoais.message === 'Parametro Invalido.') {
                console.log('verdadeiro3');
                return res.status(400).json({ Mensagem: 'CPF Inválido' });
            }


        }
        const dados = {
            nome: dadosPessoais.result.nome_da_pf,
            dataDeNascimento: dadosPessoais.result.data_nascimento,
            situacao: dadosPessoais.result.situacao_cadastral
        }
        return res.status(200).json(dados)

    } catch (error) {
        return res.status(500).json({ Mensagem: `Erro interno do servidor na rota buscarCPF: ${error.message}` })
    }

}



module.exports = {
    listarClientes,
    cadastrarCliente,
    confirmarCadastro,
    excluirCliente,
    buscarCPF
}