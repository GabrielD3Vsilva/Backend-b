require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');
<<<<<<< Updated upstream


=======
const Usuario = require('./models/Usuario');
>>>>>>> Stashed changes
const connectDB = require('./config/db');
const errorHandler = require('./middlewares/errorHandler');

const NAME_ADM = process.env.NAME_ADM;
const EMAIL_ADM = process.env.EMAIL_ADM;
const PASSWORD_ADM = process.env.PASSWORD_ADM;

async function initializeAdmin() {
    const adminExists = await Usuario.findOne({ email: 'admin@gmail.com' });
    if (!adminExists) {
        const admin = new Usuario({
            name: NAME_ADM,
            email: EMAIL_ADM,
            role: 'admin',
            password: PASSWORD_ADM,
        });
        await admin.save();
        console.log('Admin user initialized.');
    }
}

async function ensureIndexes() {
    try {
        await Usuario.collection.dropIndexes(); 
        await Usuario.createIndexes(); 
        console.log('Índices reconstruídos com sucesso.');
    } catch (err) {
        console.error('Erro ao reconstruir índices:', err);
    }
}

require('./models/Agendamento');
require('./models/CheckIn');
require('./models/Cliente');
require('./models/Historico');
require('./models/Pet');
require('./models/Servico');

const app = express();

app.use(cors());
app.use(express.json()); 

const returnApp = async (req, res) => {
    try {
        const clients = await Usuario.find({ role: 'client' }).select('-password');
        return res.status(200).json(clients);
    } catch (err) {
        console.error('Erro ao buscar usuários clientes:', err);
        return res.status(500).json({ error: 'Erro interno do servidor ao buscar clientes.' });
    }
};

app.get('/return', returnApp);

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/api/clientes', require('./routes/clienteRoutes'));
app.use('/api/pets', require('./routes/petRoutes'));
app.use('/api/servicos', require('./routes/servicoRoutes'));
app.use('/api/agendamentos', require('./routes/agendamentoRoutes'));
app.use('/api/checkins', require('./routes/checkinRoutes'));
app.use('/api/historico', require('./routes/historicoRoutes'));
app.use('/api/usuarios', require('./routes/usuariosRoutes'));
app.use('/api/petshop', require('./routes/PetshopRoutes'));
app.use('/api/rates', require('./routes/rateRoutes'));
app.use('/api/notificacao', require('./routes/notificationRoute'));
app.use('/api/clockin', require('./routes/clockinRoutes'));

app.use(errorHandler);

module.exports = app;

const PORT = process.env.PORT || 3000;

connectDB().then(() => {
    initializeAdmin();
    ensureIndexes(); 
    app.listen(PORT, () => {
        console.log(`Servidor rodando na porta ${PORT}`);
        console.log(`Acesse: http://localhost:${PORT}`);
    });
}).catch(err => {
    console.error('Falha ao conectar ao banco de dados ou iniciar o admin:', err);
    process.exit(1);
});