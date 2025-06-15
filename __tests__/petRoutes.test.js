const request = require('supertest');
const app = require('express')();
const Pet = require('../models/Pet');

app.use(require('body-parser').json());
const routes = require('../routes/petRoutes');
app.use(routes);

jest.mock('../models/Pet');

describe('Pet Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /cliente/:clienteId', () => {
    test('deve retornar pets de um cliente', async () => {
      const mockPets = [
        { _id: '1', nome: 'Rex', clienteId: '123' },
        { _id: '2', nome: 'Luna', clienteId: '123' }
      ];

      Pet.find.mockResolvedValue(mockPets);

      const response = await request(app)
        .get('/cliente/123');

      expect(response.status).toBe(200);
      expect(response.body.length).toBe(2);
    });
  });

  describe('POST /', () => {
    test('deve criar um novo pet', async () => {
      const mockPet = {
        _id: '1',
        nome: 'Rex',
        clienteId: '123',
        save: jest.fn().mockResolvedValue(true)
      };

      Pet.mockImplementation(() => mockPet);

      const response = await request(app)
        .post('/')
        .send({
          clienteId: '123',
          nome: 'Rex',
          raca: 'Labrador',
          dataNascimento: '2020-01-01',
          peso: 25
        });

      expect(response.status).toBe(201);
      expect(response.body.nome).toBe('Rex');
    });
  });

  describe('GET /', () => {
    test('deve retornar todos os pets quando não há query', async () => {
      const mockPets = [
        { _id: '1', nome: 'Rex' },
        { _id: '2', nome: 'Luna' }
      ];

      Pet.find.mockResolvedValue(mockPets);

      const response = await request(app)
        .get('/');

      expect(response.status).toBe(200);
      expect(response.body.length).toBe(2);
    });

    test('deve filtrar pets por IDs', async () => {
      const mockPets = [
        { _id: '1', nome: 'Rex' }
      ];

      Pet.find.mockResolvedValue(mockPets);

      const response = await request(app)
        .get('/?ids=1,2,3');

      expect(response.status).toBe(200);
      expect(response.body.length).toBe(1);
    });
  });
});