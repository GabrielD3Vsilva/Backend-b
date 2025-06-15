const routes = require('express').Router();
const Usuario = require('../models/Usuario');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
require('dotenv').config();
const { authenticateToken, authorizeRoles } = require('../middlewares/auth'); 
const Cliente = require('../models/Cliente');

routes.post('/', async (req, res) => {
    const { email, password } = req.body;

    try {
        const usuario = await Usuario.findOne({ email }).select('+password');
        if (!usuario) {
            return res.status(401).json({ error: 'Usuário não encontrado' });
        }

        const isMatch = await usuario.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Senha inválida' });
        }

        const token = jwt.sign(
            { id: usuario._id, email: usuario.email, role: usuario.role },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        const usuarioObj = usuario.toObject();
        delete usuarioObj.password;

        return res.json({ user: usuarioObj, token }); 
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Erro no servidor' });
    }
});


routes.post('/criar-executor', authenticateToken, authorizeRoles('gerent'), async (req, res) => {
    const { name, email, password, petshop } = req.body;

    try {
        const existingUser = await Usuario.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ error: 'Já existe um usuário com este email.' });
        }

        const newExecutor = new Usuario({
            name: name,
            email: email,
            password: password, 
            petshop: petshop,
            role: 'executor'
        });

        await newExecutor.save();

        const executorObj = newExecutor.toObject();
        delete executorObj.password;

        return res.status(201).json({ message: 'Usuário executor criado com sucesso!', user: executorObj });
    } catch (err) {
        console.error('Erro ao criar usuário executor:', err);
        if (err.name === 'ValidationError') {
            return res.status(400).json({ error: err.message });
        }
        return res.status(500).json({ error: 'Erro interno do servidor ao criar usuário executor.' });
    }
});

routes.post('/cadastro-cliente', async (req, res) => {
    const { name, email, password } = req.body;

    try {
        const existingUser = await Usuario.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ error: 'Já existe uma conta com este email.' });
        }

        const newClient = new Usuario({
            name: name,
            email: email,
            password: password,
            role: 'client'
        });

        await createClient( name, email); 

        await newClient.save();

        const token = jwt.sign(
            { id: newClient._id, email: newClient.email, role: newClient.role },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        const clientObj = newClient.toObject();
        delete clientObj.password;

        return res.status(201).json({
            message: 'Conta de cliente criada com sucesso!',
            user: clientObj, 
            token
        });
    } catch (err) {
        console.error('Erro ao cadastrar cliente:', err);
        if (err.name === 'ValidationError') {
            return res.status(400).json({ error: err.message });
        }
        return res.status(500).json({ error: 'Erro interno do servidor ao cadastrar cliente.' });
    }
});

routes.get('/executors', authenticateToken, authorizeRoles('admin', 'gerent'), async (req, res) => {
    try {
        const executors = await Usuario.find({ role: 'executor' }).select('-password'); 
        return res.status(200).json(executors);
    } catch (err) {
        console.error('Erro ao buscar usuários executores:', err);
        return res.status(500).json({ error: 'Erro interno do servidor ao buscar executores.' });
    }
});


routes.get('/returnClient', authenticateToken, authorizeRoles('admin', 'gerent', 'executor'), async (req, res) => {
    try {

        const clients = await Usuario.find({ role: 'client' }).select('-password');
        
        return res.status(200).json(clients);
    } catch (err) {
        console.error('Erro ao buscar usuários clientes:', err);

        return res.status(500).json({ error: 'Erro interno do servidor ao buscar clientes.' });
    }
});


routes.put('/executors/:id', authenticateToken, authorizeRoles('admin', 'gerent'), async (req, res) => {
    const { id } = req.params; 
    const { name, email, password } = req.body; 

    try {
        let executor = await Usuario.findById(id);

        if (!executor || executor.role !== 'executor') {
            return res.status(404).json({ error: 'Executor não encontrado ou não é um executor.' });
        }

        
        if (name) executor.name = name;
        if (email) {
            
            const existingUserWithEmail = await Usuario.findOne({ email });
            if (existingUserWithEmail && String(existingUserWithEmail._id) !== id) {
                return res.status(409).json({ error: 'Este email já está em uso por outro usuário.' });
            }
            executor.email = email;
        }
        if (password) {
            
            executor.password = password;
        }

        await executor.save(); 

        const updatedExecutorObj = executor.toObject();
        delete updatedExecutorObj.password; 

        return res.status(200).json({ message: 'Executor atualizado com sucesso!', user: updatedExecutorObj });
    } catch (err) {
        console.error('Erro ao editar usuário executor:', err);
        if (err.name === 'CastError') {
            return res.status(400).json({ error: 'ID de executor inválido.' });
        }
        if (err.name === 'ValidationError') {
            return res.status(400).json({ error: err.message });
        }
        return res.status(500).json({ error: 'Erro interno do servidor ao atualizar executor.' });
    }
});


routes.delete('/executors/:id', authenticateToken, authorizeRoles('admin', 'gerent'), async (req, res) => {
    const { id } = req.params;

    try {
        const result = await Usuario.findOneAndDelete({ _id: id, role: 'executor' });

        if (!result) {
            return res.status(404).json({ error: 'Executor não encontrado ou não é um executor.' });
        }

        return res.status(200).json({ message: 'Executor deletado com sucesso!' });
    } catch (err) {
        console.error('Erro ao deletar usuário executor:', err);
        if (err.name === 'CastError') { 
            return res.status(400).json({ error: 'ID de executor inválido.' });
        }
        return res.status(500).json({ error: 'Erro interno do servidor ao deletar executor.' });
    }
});


const createClient = async (nome, email) => {
    try {
        const novoCliente = new Cliente({ nome: nome, email: email });
        await novoCliente.save();
        return novoCliente; 
    } catch (err) {
        console.log(err);
        throw err; 
    }
}

module.exports = routes;