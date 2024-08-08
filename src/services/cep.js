const axios = require('axios')

const buscarEnderecoPorCep = async (cep) => {
    try {
        const response = await axios.get(`https://viacep.com.br/ws/${cep}/json/`);
        if (response.data.erro) {

            throw new Error('CEP não encontrado');
        }
        return response.data;
    } catch (error) {
        throw new Error(error.message);
    }
}

module.exports = buscarEnderecoPorCep