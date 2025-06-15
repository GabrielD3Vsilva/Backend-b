const request = require('supertest');
const app = require('express')();
const Notificacao = require('../models/Notificacao');

app.use(require('body-parser').json());
const routes = require('../routes/notificationRoute');
app.use(routes);

jest.mock('../models/Notificacao');

describe('Notification Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /', () => {
    test('deve retornar todas as notificações', async () => {
      const mockNotifications = [
        { _id: '1', message: 'Notificação 1' },
        { _id: '2', message: 'Notificação 2' }
      ];

      Notificacao.find.mockResolvedValue(mockNotifications);

      const response = await request(app)
        .get('/');

      expect(response.status).toBe(200);
      expect(response.body.length).toBe(2);
      expect(response.body[0].message).toBe('Notificação 1');
      expect(Notificacao.find).toHaveBeenCalledTimes(1);
    });

    test('deve retornar array vazio quando não houver notificações', async () => {
      Notificacao.find.mockResolvedValue([]);

      const response = await request(app)
        .get('/');

      expect(response.status).toBe(200);
      expect(response.body).toEqual([]);
    });

    test('deve lidar com erros do banco de dados', async () => {
      Notificacao.find.mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .get('/');

      expect(response.status).toBe(500);
    });
  });
});

afterAll(() => {
  jest.restoreAllMocks();
});