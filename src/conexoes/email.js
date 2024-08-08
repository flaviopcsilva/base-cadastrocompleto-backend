const nodemailer = require('nodemailer')

const transporteEmail = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_GOOGLE,
        pass: process.env.SENHA_GOOGLE
    }
});

module.exports = transporteEmail