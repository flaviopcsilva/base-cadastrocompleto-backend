const crypto = require('crypto');
const transporteEmail = require('../conexoes/email');
const twilio = require('twilio')
const accountSid = process.env.TWILIO_ACCOUNT_SID; // Seu Account SID
const authToken = process.env.TWILIO_AUTH_TOKEN; // Seu Auth Token
const client = new twilio(accountSid, authToken);


// const gerarCodigoConfirmacao = () => {
//     return crypto.randomBytes(3).toString('hex'); // Gera um código de 6 caracteres
// };


const gerarCodigoConfirmacao = () => {
    // Gera um número aleatório entre 100000 e 999999
    const min = 100000;
    const max = 999999;
    return Math.floor(Math.random() * (max - min + 1)) + min;
};

const formatarNumeroParaE164 = (numero) => {
    // Remover caracteres não numéricos
    const numeroLimpo = numero.replace(/[^\d]/g, '');
    // Adicionar código do país (exemplo para o Brasil: +55)
    return `+55${numeroLimpo}`;
};

const enviarSMSConfirmacao = async (telefone, codigo) => {
    try {

        const telefoneFormatado = formatarNumeroParaE164(telefone);

        await client.messages.create({
            body: `Seu código de confirmação é: ${codigo}`,
            from: process.env.TWILIO_PHONE_NUMBER, // Seu número Twilio
            to: telefoneFormatado
        });
        console.log('SMS enviado com sucesso.');
    } catch (error) {
        console.error('Erro ao enviar SMS:', error);
    }
};

const enviarEmailConfirmacao = async (email, codigo) => {
    const mailOptions = {
        from: 'no-reply@gmail.com',
        to: email,
        subject: 'Confirmação de Cadastro',
        text: `Seu código de confirmação é: ${codigo}`
    };
    await transporteEmail.sendMail(mailOptions)
}

module.exports = {
    gerarCodigoConfirmacao,
    enviarEmailConfirmacao,
    enviarSMSConfirmacao
}