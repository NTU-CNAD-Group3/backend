import { jest } from '@jest/globals';

const mockCreateRacks = jest.fn();
const mockGetRack = jest.fn();
const mockUpdateRack = jest.fn();
const mockDeleteRack = jest.fn();

await jest.unstable_mockModule('#src/services/rack.service.js', () => ({
  default: {
    createRacks: mockCreateRacks,
    getRack: mockGetRack,
    updateRack: mockUpdateRack,
    deleteRack: mockDeleteRack,
  },
}));

const { createRacksController, getRackController, updateRackController, deleteRackController } = await import(
  '#src/controllers/rack.controller.js'
);

describe('Rack Controllers', () => {
  let req, res;

  beforeEach(() => {
    req = {};
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    jest.clearAllMocks();
  });

  describe('createRacksController', () => {
    test('should create racks successfully', async () => {
      req.body = { fabName: 'Fab1', roomId: 1, rackNum: 2, rackArray: [] };

      await createRacksController(req, res);

      expect(mockCreateRacks).toHaveBeenCalledWith('Fab1', 1, 2, []);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ message: 'Created' });
    });

    test('should throw error if required fields are missing', async () => {
      req.body = { fabName: null, roomId: 1, rackNum: 2, rackArray: [] };

      await expect(createRacksController(req, res)).rejects.toThrow('fabName, roomId, rackNum and rackArray are required');
      expect(mockCreateRacks).not.toHaveBeenCalled();
    });
  });

  describe('getRackController', () => {
    test('should return rack data successfully', async () => {
      req.query = { fabName: 'Fab1', roomId: 1, rackId: 10 };
      const mockRack = { name: 'Rack A' };
      mockGetRack.mockResolvedValue(mockRack);

      await getRackController(req, res);

      expect(mockGetRack).toHaveBeenCalledWith('Fab1', 1, 10);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ data: mockRack, message: 'OK' });
    });

    test('should throw error if required fields are missing', async () => {
      req.query = { fabName: null, roomId: 1, rackId: 10 };

      await expect(getRackController(req, res)).rejects.toThrow('fabName, roomId and rackId are required');
      expect(mockGetRack).not.toHaveBeenCalled();
    });
  });

  describe('updateRackController', () => {
    test('should update rack successfully', async () => {
      req.body = { rackId: 10, name: 'New Name' };

      await updateRackController(req, res);

      expect(mockUpdateRack).toHaveBeenCalledWith(10, 'New Name');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: 'Updated' });
    });

    test('should throw error if required fields are missing', async () => {
      req.body = { rackId: null, name: 'New Name' };

      await expect(updateRackController(req, res)).rejects.toThrow('rackId and name are required');
      expect(mockUpdateRack).not.toHaveBeenCalled();
    });
  });

  describe('deleteRackController', () => {
    test('should delete rack successfully', async () => {
      req.params = { rackId: 1, roomId: 10 };

      await deleteRackController(req, res);

      expect(mockDeleteRack).toHaveBeenCalledWith(1, 10);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: 'Deleted' });
    });

    test('should throw error if required fields are missing', async () => {
      req.params = { rackId: null, roomId: 10 };

      await expect(deleteRackController(req, res)).rejects.toThrow('rackId and roomId are required');
      expect(mockDeleteRack).not.toHaveBeenCalled();
    });
  });
});
