const fs = require('fs')
const path = require('path')

// Caminho para o arquivo HTML
const caminhoArquivoHTML = 'src/html/corpoEmailCadastroSucesso.html';

//caminho do arquivo do corpo de confirmação de cadastro

const caminhoConfirmacaoCadastroHTML = 'src/html/emailConfirmacaoCadastro.html'

// Ler o arquivo HTML de forma síncrona
const corpoDoEmail = fs.readFileSync(caminhoArquivoHTML, 'utf8');

const corpoConfirmacaoCadastro = fs.readFileSync(caminhoConfirmacaoCadastroHTML, 'utf8')

console.log(corpoDoEmail)
console.log(corpoConfirmacaoCadastro);

// Exportar o conteúdo do corpo do e-mail
module.exports = {
    corpoConfirmacaoCadastro,
    corpoDoEmail
}