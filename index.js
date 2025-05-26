// server.js
require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');


const connectDB = require('./config/db');
const errorHandler = require('./middlewares/errorHandler'); 

require('./models/Agendamento');
require('./models/CheckIn');
require('./models/Cliente');
require('./models/Historico');
require('./models/Pet');
require('./models/Servico');


const clienteRoutes = require('./routes/clienteRoutes');
const petRoutes = require('./routes/petRoutes');
const servicoRoutes = require('./routes/servicoRoutes');
const agendamentoRoutes = require('./routes/agendamentoRoutes');
const checkinRoutes = require('./routes/checkinRoutes');
const historicoRoutes = require('./routes/historicoRoutes');

const app = express();

connectDB();

app.use(cors());
app.use(express.json()); 


app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


app.use('/api/clientes', clienteRoutes);

app.use('/api/pets', petRoutes);
app.use('/api/servicos', servicoRoutes);
app.use('/api/agendamentos', agendamentoRoutes);
app.use('/api/checkins', checkinRoutes);
app.use('/api/historico', historicoRoutes);


app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
    console.log(`Acesse: http://localhost:${PORT}`);
});