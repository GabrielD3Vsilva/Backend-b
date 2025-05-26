const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://gabrield3vsilva:mYoTxNAvOIckyNDW@cluster0.syhanoa.mongodb.net/', {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 30000 // Aumenta o timeout para 30 segundos
        });
        console.log('Conectado ao MongoDB');
    } catch (err) {
        console.error('Erro na conexão com MongoDB:', err.message);
        process.exit(1);
    }
};

module.exports = connectDB;