const formatarCPF = cpf => {
    // Remove caracteres não numéricos
    cpf = cpf.replace(/\D/g, '');

    // Aplica a máscara de CPF (999.999.999-99)
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}

const formatarCEP = cep => {
    // Remove caracteres não numéricos
    cep = cep.replace(/\D/g, '');

    // Aplica a máscara de CEP (99.999-999)
    return cep.replace(/(\d{2})(\d{3})(\d{3})/, '$1.$2-$3');
}

const formatarTelefone = telefone => {
    // Remove caracteres não numéricos
    telefone = telefone.replace(/\D/g, '');

    // Aplica a máscara de telefone ((99) 99999-9999)
    return telefone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
}

// Função para formatar a data
const formatDate = date => {
    const formattedDate = new Date(date).toLocaleDateString('pt-BR');
    return formattedDate; // Retorna a data formatada como dd/mm/aaaa
}

module.exports = {
    formatarCEP,
    formatarCPF,
    formatarTelefone,
    formatDate
}