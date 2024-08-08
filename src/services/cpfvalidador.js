const { cpf } = require('cpf-cnpj-validator');

function validarCPF(cpfInput) {
    return cpf.isValid(cpfInput);
}

module.exports = {
    validarCPF
};