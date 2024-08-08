const transporteEmail = require("../conexoes/email");

const confirmacaoDeCadastroCliente = async (email, corpoemail) => {
    const mailOptions = {
        from: process.env.EMAIL,
        to: email,
        subject: 'Verificação de Código',
        html: corpoemail
    };
    await transporteEmail.sendMail(mailOptions)
}

const cadastradoComSucesso = async (email, corpoemail) => {
    const mailOptions = {
        from: process.env.EMAIL,
        to: email,
        subject: 'Confirmação de Cadastro',
        html: corpoemail
    };
    await transporteEmail.sendMail(mailOptions)
}

module.exports = {
    cadastradoComSucesso,
    confirmacaoDeCadastroCliente
}