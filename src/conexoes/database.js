const fs = require('fs')
const path = require('path');
const caPath = path.resolve(__dirname, 'ca.pem');

const knex = require('knex')({
    client: 'pg',
    connection: {
        host: process.env.HOST_DB,
        port: process.env.PORT_DB,
        user: process.env.USER_DB,
        password: process.env.PASSWORD_DB,
        database: process.env.DATABASE_DB,
        ssl: {
            rejectUnauthorized: true,
            ca: fs.readFileSync(caPath).toString()
        },
    }
});


const db = knex;

// Teste da conexão
db.raw('SELECT 1+1 AS result')
    .then(() => {
        console.log('Conectado ao banco de dados PostgreSQL utilizando Knex');
    })
    .catch((err) => {
        console.error('Erro ao conectar ao banco de dados:', err);
    });

module.exports = knex