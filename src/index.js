require('dotenv').config()
const express = require('express')
const rotas = require('./rotas')
const app = express()
const cors = require('cors')

// Configuração para permitir CORS apenas do seu domínio frontend


const corsOptions = {
    origin: ['https://painel-transporthos.vercel.app', 'https://painel-transporthos.vercel.app/enviar-pdf', 'http://localhost:4200'], // Substitua pelo seu domínio frontend
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
    optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));



app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Erro interno do servidor');
});

// Middleware para lidar com o preflight request
app.options('*', cors(corsOptions));

app.use(express.json())

app.use(rotas)

app.listen(process.env.PORT_SERVER, () => {
    console.log(`Servidor Rodando na Porta ${process.env.PORT_SERVER}`)
})