const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.SENHA_JWT; // Use uma variável específica para JWT

const verificarToken = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ mensagem: 'Token não fornecido.' });
    }

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).json({ mensagem: 'Token inválido ou expirado.' });
        }

        req.user = decoded; // Armazena informações do usuário decodificadas no request
        next(); // Passa para o próximo middleware ou rota
    });
}

module.exports = verificarToken;
