const request = require('supertest');
const app = require('express')();
const Petshop = require('../models/Petshop');
const Usuario = require('../models/Usuario');

app.use(require('body-parser').json());
const routes = require('../routes/PetshopRoutes');
app.use(routes);

jest.mock('../models/Petshop');
jest.mock('../models/Usuario');
jest.mock('../middlewares/auth', () => ({
  authenticateToken: (req, res, next) => next(), 
  authorizeRoles: (...roles) => (req, res, next) => next() 
}));

describe('Petshop Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /', () => {
    test('deve criar um novo petshop e usuário admin', async () => {
      const mockPetshop = {
        _id: '1',
        nomePetshop: 'PetShop Teste',
        save: jest.fn().mockResolvedValue(true)
      };
      const mockUser = {
        _id: '2',
        save: jest.fn().mockResolvedValue(true)
      };

      Petshop.mockImplementation(() => mockPetshop);
      Usuario.mockImplementation(() => mockUser);

      const response = await request(app)
        .post('/')
        .send({
          nomePetshop: 'PetShop Teste',
          nomeAdm: 'Admin',
          endereco: 'Rua Teste',
          telefone: '123456789',
          email: 'admin@test.com',
          senha: 'password123'
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('message', 'Petshop cadastrado com sucesso!');
    });
  });

  describe('GET /', () => {
    test('deve listar todos os petshops', async () => {
      const mockPetshops = [
        { _id: '1', nomePetshop: 'PetShop 1' },
        { _id: '2', nomePetshop: 'PetShop 2' }
      ];

      Petshop.find.mockResolvedValue(mockPetshops);

      const response = await request(app)
        .get('/');

      expect(response.status).toBe(200);
      expect(response.body.length).toBe(2);
    });
  });

  describe('GET /:id', () => {
    test('deve retornar um petshop específico', async () => {
      const mockPetshop = { _id: '1', nomePetshop: 'PetShop Teste' };

      Petshop.findById.mockResolvedValue(mockPetshop);

      const response = await request(app)
        .get('/1');

      expect(response.status).toBe(200);
      expect(response.body.nomePetshop).toBe('PetShop Teste');
    });
  });

  describe('PUT /:id', () => {
    test('deve atualizar um petshop existente', async () => {
      const mockPetshop = {
        _id: '1',
        nomePetshop: 'PetShop Antigo',
        save: jest.fn().mockResolvedValue(true)
      };
      const mockUser = {
        _id: '2',
        save: jest.fn().mockResolvedValue(true)
      };

      Petshop.findById.mockResolvedValue(mockPetshop);
      Usuario.findOne.mockResolvedValue(mockUser);

      const response = await request(app)
        .put('/1')
        .send({
          nomePetshop: 'PetShop Atualizado'
        });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Petshop atualizado com sucesso!');
    });
  });

  describe('DELETE /:id', () => {
    test('deve deletar um petshop e usuário associado', async () => {
      const mockPetshop = {
        _id: '1',
        email: 'admin@test.com'
      };

      Petshop.findById.mockResolvedValue(mockPetshop);
      Petshop.findByIdAndDelete.mockResolvedValue(true);
      Usuario.deleteOne.mockResolvedValue({ deletedCount: 1 });

      const response = await request(app)
        .delete('/1');

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Petshop e usuário administrador associado excluídos com sucesso!');
    });
  });
});