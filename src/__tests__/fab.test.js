import { jest } from '@jest/globals';
import { pool, databaseConnection } from '../models/db.js';
import adminController from '../controllers/admin.controller.js';
import adminService from '../services/admin.service.js';
// import logger from '@/utils/logger.js';
// jest.mock('@/utils/logger.js');
describe('Admin Fab Service', () => {
  beforeAll(async () => {
    // await pool.connect();
    await databaseConnection();
  });
  afterAll(async () => {
    await pool.query('DROP TABLE IF EXISTS fabs CASCADE;'); // 清除資料
    await pool.end();
  });
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it('should create a new fab', async () => {
    const req = {
      body: { name: 'Fab 1', roomNum: 101 },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    const mockFab = {
      id: 1,
      name: 'Fab 1',
      roomNum: 101,
      createdAt: 'any-created-at',
      updatedAt: 'any-updated-at',
    };
    adminService.createFab = jest.fn().mockResolvedValue(mockFab);

    await adminController.createFab(req, res);

    expect(adminService.createFab).toHaveBeenCalledWith('Fab 1', 101);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 1,
        name: 'Fab 1',
        roomNum: 101,
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
      }),
    );
  });
});
