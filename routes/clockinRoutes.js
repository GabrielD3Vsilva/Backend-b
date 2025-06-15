const request = require('supertest');
const app = require('express')();

jest.mock('../models/Clockin');
jest.mock('../models/Clockout');
const Clockin = require('../models/Clockin');
const Clockout = require('../models/Clockout');

app.use(require('../routes/clockRoutes'));

describe('Clock Routes', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /', () => {
    it('should create a new clockin and return ok', async () => {
      const mockSave = jest.fn().mockResolvedValue({});
      Clockin.mockImplementation(() => ({
        save: mockSave,
      }));

      const response = await request(app)
        .post('/')
        .send({ petshopName: 'Test Shop', executorName: 'Test Executor' });

      expect(response.status).toBe(200);
      expect(response.text).toBe('ok');
      expect(mockSave).toHaveBeenCalled();
    });
  });

  describe('GET /', () => {
    it('should return all clockins', async () => {
      const mockFind = jest.fn().mockResolvedValue([{ petshopName: 'Test Shop', executorName: 'Test Executor' }]);
      Clockin.find = mockFind;

      const response = await request(app).get('/');

      expect(response.status).toBe(200);
      expect(response.body).toEqual([{ petshopName: 'Test Shop', executorName: 'Test Executor' }]);
      expect(mockFind).toHaveBeenCalled();
    });
  });

  describe('POST /clockout', () => {
    it('should create a new clockout and return ok', async () => {
      const mockSave = jest.fn().mockResolvedValue({});
      Clockout.mockImplementation(() => ({
        save: mockSave,
      }));

      const response = await request(app)
        .post('/clockout')
        .send({ petshopName: 'Test Shop', executorName: 'Test Executor' });

      expect(response.status).toBe(200);
      expect(response.text).toBe('ok');
      expect(mockSave).toHaveBeenCalled();
    });
  });

  describe('GET /clockout', () => {
    it('should return all clockouts', async () => {
      const mockFind = jest.fn().mockResolvedValue([{ petshopName: 'Test Shop', executorName: 'Test Executor' }]);
      Clockout.find = mockFind;

      const response = await request(app).get('/clockout');

      expect(response.status).toBe(200);
      expect(response.body).toEqual([{ petshopName: 'Test Shop', executorName: 'Test Executor' }]);
      expect(mockFind).toHaveBeenCalled();
    });
  });
});