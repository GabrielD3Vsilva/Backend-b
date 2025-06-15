const routes = require('express').Router();
const Petshop = require('../models/Petshop');
const { authenticateToken, authorizeRoles } = require('../middlewares/auth');
const Usuario = require('../models/Usuario');

routes.post('/', authenticateToken, authorizeRoles('admin'), async (req, res) => {
    const { nomePetshop, nomeAdm, endereco, telefone, email, senha } = req.body;

    try {
        const newPetshop = new Petshop({
            nomePetshop: nomePetshop,
            nomeAdm: nomeAdm,
            endereco: endereco,
            telefone: telefone,
            email: email,
            senha: senha
        });

        await newPetshop.save();

        const newUser = new Usuario(
            {
                name: nomeAdm,
                email: email,
                password: senha,
                petshop: nomePetshop,
                role: 'gerent'
            }
        )

        await newUser.save();

        return res.status(201).json({ message: 'Petshop cadastrado com sucesso!', petshop: newPetshop });
    } catch (error) {
        console.error('Erro ao cadastrar Petshop:', error);
        return res.status(500).json({ error: 'Erro interno do servidor ao cadastrar Petshop.' });
    }
});

routes.get('/', authenticateToken, async (req, res) => {
    try {
        const petshops = await Petshop.find();
        return res.status(200).json(petshops);
    } catch (error) {
        console.error('Erro ao buscar Petshops:', error);
        return res.status(500).json({ error: 'Erro interno do servidor ao buscar Petshops.' });
    }
});


routes.get('/:id', authenticateToken, authorizeRoles('admin', 'gerent'), async (req, res) => {
    try {
        const petshop = await Petshop.findById(req.params.id);
        if (!petshop) {
            return res.status(404).json({ message: 'Petshop não encontrado.' });
        }
        return res.status(200).json(petshop);
    } catch (error) {
        console.error('Erro ao buscar Petshop:', error);
        return res.status(500).json({ error: 'Erro interno do servidor ao buscar Petshop.' });
    }
});


routes.put('/:id', authenticateToken, authorizeRoles('admin'), async (req, res) => {
    const { id } = req.params;
    const { nomePetshop, nomeAdm, endereco, telefone, email, senha } = req.body; 

    try {
        
        const petshopToUpdate = await Petshop.findById(id);
        if (!petshopToUpdate) {
            return res.status(404).json({ message: 'Petshop não encontrado para atualização.' });
        }

        const userToUpdate = await Usuario.findOne({ email: petshopToUpdate.email });
        if (!userToUpdate) {
            console.warn(`Usuário administrador com email ${petshopToUpdate.email} não encontrado para o petshop ${id}.`);   
        }

        petshopToUpdate.nomePetshop = nomePetshop || petshopToUpdate.nomePetshop;
        petshopToUpdate.nomeAdm = nomeAdm || petshopToUpdate.nomeAdm;
        petshopToUpdate.endereco = endereco || petshopToUpdate.endereco;
        petshopToUpdate.telefone = telefone || petshopToUpdate.telefone;
        petshopToUpdate.email = email || petshopToUpdate.email;


        if (senha) {
            petshopToUpdate.senha = senha;
        }

        await petshopToUpdate.save();


        if (userToUpdate) {
            userToUpdate.name = nomeAdm || userToUpdate.name;
            userToUpdate.email = email || userToUpdate.email;

            await userToUpdate.save();
        }


        return res.status(200).json({ message: 'Petshop atualizado com sucesso!', petshop: petshopToUpdate });
    } catch (error) {
        console.error('Erro ao atualizar Petshop:', error);
        return res.status(500).json({ error: 'Erro interno do servidor ao atualizar Petshop.' });
    }
});


routes.delete('/:id', authenticateToken, authorizeRoles('admin'), async (req, res) => {
    const { id } = req.params;

    try {

        const petshopToDelete = await Petshop.findById(id);
        if (!petshopToDelete) {
            return res.status(404).json({ message: 'Petshop não encontrado para exclusão.' });
        }

        
        await Petshop.findByIdAndDelete(id);

      
        const userDeleted = await Usuario.deleteOne({ email: petshopToDelete.email, role: 'gerent' });

        if (userDeleted.deletedCount === 0) {
            console.warn(`Usuário administrador com email ${petshopToDelete.email} não encontrado ou não deletado ao excluir o petshop ${id}.`);
        }

        return res.status(200).json({ message: 'Petshop e usuário administrador associado excluídos com sucesso!' });
    } catch (error) {
        console.error('Erro ao deletar Petshop:', error);
        return res.status(500).json({ error: 'Erro interno do servidor ao deletar Petshop.' });
    }
});

module.exports = routes;