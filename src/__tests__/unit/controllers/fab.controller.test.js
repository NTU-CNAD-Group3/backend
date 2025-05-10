import { jest } from '@jest/globals';

// const mockGetFabDetails = jest.fn();
// const mockGetAllRooms = jest.fn();
const mockGetAllFabs = jest.fn();
const mockGetFab = jest.fn();
const mockCreateFab = jest.fn();
const mockUpdateFab = jest.fn();
const mockDeleteFab = jest.fn();

jest.unstable_mockModule('#src/services/fab.service.js', () => ({
  default: {
    // getFabDetails: mockGetFabDetails,
    // getAllRooms: mockGetAllRooms,
    getAllFabs: mockGetAllFabs,
    getFab: mockGetFab,
    createFab: mockCreateFab,
    updateFab: mockUpdateFab,
    deleteFab: mockDeleteFab,
  },
}));

const {
  // getFabDetailsController,
  // getAllRoomsController,
  getAllFabsController,
  getFabController,
  createFabController,
  updateFabController,
  deleteFabController,
} = await import('#src/controllers/fab.controller.js');

const fabService = (await import('#src/services/fab.service.js')).default;

const getMockReqRes = () => {
  const mockReq = {
    params: {},
    query: {},
    body: {},
  };
  const mockRes = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
    send: jest.fn(),
  };
  return { mockReq, mockRes };
};

describe('Fab Controller – Unit Tests', () => {
  let mockReq, mockRes;

  beforeEach(() => {
    const { mockReq: req, mockRes: res } = getMockReqRes();
    mockReq = req;
    mockRes = res;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // // --- getFabDetailsController ---
  // describe('getFabDetailsController', () => {
  //   it('should return 400 if name is missing', async () => {
  //     mockReq.query = {}; // No name provided

  //     await getFabDetailsController(mockReq, mockRes);

  //     expect(fabService.getFabDetails).not.toHaveBeenCalled();
  //     expect(mockRes.status).toHaveBeenCalledWith(400);
  //     expect(mockRes.json).toHaveBeenCalledWith({ error: 'Name is required' });
  //   });

  //   it('should call service and return fab details on success', async () => {
  //     const mockName = 'FabA';
  //     const mockDetails = [{ fabid: 1, fabname: 'FabA', roomname: 'Room1' }];
  //     mockReq.query = { name: mockName };
  //     // Service returns the raw DB result, controller extracts .rows
  //     mockGetFabDetails.mockResolvedValue({ rows: mockDetails });

  //     await getFabDetailsController(mockReq, mockRes);

  //     expect(fabService.getFabDetails).toHaveBeenCalledTimes(1);
  //     expect(fabService.getFabDetails).toHaveBeenCalledWith(mockName);
  //     expect(mockRes.status).toHaveBeenCalledWith(200);
  //     expect(mockRes.json).toHaveBeenCalledWith(mockDetails);
  //   });

  //   it('should return 500 if service throws an error', async () => {
  //     const mockName = 'FabA';
  //     const mockError = new Error('Service failed');
  //     mockReq.query = { name: mockName };
  //     mockGetFabDetails.mockRejectedValue(mockError); // Simulate service error

  //     await getFabDetailsController(mockReq, mockRes);

  //     expect(fabService.getFabDetails).toHaveBeenCalledTimes(1);
  //     expect(fabService.getFabDetails).toHaveBeenCalledWith(mockName);
  //     expect(mockRes.status).toHaveBeenCalledWith(500);
  //     expect(mockRes.json).toHaveBeenCalledWith({ error: 'Can not get fab details' });
  //   });
  // });

  // // --- getAllRoomsController ---
  // describe('getAllRoomsController', () => {
  //   it('should return 400 if id is missing', async () => {
  //     mockReq.params = {}; // No id

  //     await getAllRoomsController(mockReq, mockRes);

  //     expect(fabService.getAllRooms).not.toHaveBeenCalled();
  //     expect(mockRes.status).toHaveBeenCalledWith(400);
  //     expect(mockRes.json).toHaveBeenCalledWith({ error: 'Fab ID is required' });
  //   });

  //   it('should call service and return rooms on success', async () => {
  //     const mockFabId = '1';
  //     const mockRooms = [
  //       { id: 10, name: 'RoomA' },
  //       { id: 11, name: 'RoomB' },
  //     ];
  //     mockReq.params = { id: mockFabId };
  //     mockGetAllRooms.mockResolvedValue(mockRooms);

  //     await getAllRoomsController(mockReq, mockRes);

  //     expect(fabService.getAllRooms).toHaveBeenCalledTimes(1);
  //     expect(fabService.getAllRooms).toHaveBeenCalledWith(mockFabId);
  //     expect(mockRes.status).toHaveBeenCalledWith(200);
  //     expect(mockRes.json).toHaveBeenCalledWith(mockRooms);
  //   });

  //   it('should return 500 if service throws an error', async () => {
  //     const mockFabId = '1';
  //     const mockError = new Error('Service failed');
  //     mockReq.params = { id: mockFabId };
  //     mockGetAllRooms.mockRejectedValue(mockError);

  //     await getAllRoomsController(mockReq, mockRes);

  //     expect(fabService.getAllRooms).toHaveBeenCalledTimes(1);
  //     expect(fabService.getAllRooms).toHaveBeenCalledWith(mockFabId);
  //     expect(mockRes.status).toHaveBeenCalledWith(500);
  //     expect(mockRes.json).toHaveBeenCalledWith({ error: 'Can not get all rooms' });
  //   });
  // });

  // --- getAllFabsController ---
  describe('getAllFabsController', () => {
    it('should call service and return all fabs on success', async () => {
      const mockFabs = [
        { id: 1, name: 'FabA' },
        { id: 2, name: 'FabB' },
      ];
      mockGetAllFabs.mockResolvedValue(mockFabs);

      await getAllFabsController(mockReq, mockRes);

      expect(fabService.getAllFabs).toHaveBeenCalledTimes(1);
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({ data: mockFabs, message: 'OK' });
    });
    it('should throw error if service fails', async () => {
      mockGetAllFabs.mockRejectedValue(new Error('Service failed'));
      await expect(getAllFabsController(mockReq, mockRes)).rejects.toThrow('Service failed');
    });
    // it('should return 500 if service throws an error', async () => {
    //   const mockError = new Error('Service failed');
    //   mockGetAllFabs.mockRejectedValue(mockError);

    //   await getAllFabsController(mockReq, mockRes);

    //   expect(fabService.getAllFabs).toHaveBeenCalledTimes(1);
    //   expect(mockRes.status).toHaveBeenCalledWith(500);
    //   expect(mockRes.json).toHaveBeenCalledWith({ error: 'Can not get all fabs' });
    // });
  });

  // --- getFabController ---
  describe('getFabController', () => {
    it('should return 400 if id is missing', async () => {
      mockReq.query = {};
      await expect(getFabController(mockReq, mockRes)).rejects.toThrow('Fab ID is required');

      expect(fabService.getFab).not.toHaveBeenCalled();
      // expect(mockRes.status).toHaveBeenCalledWith(400);
    });

    it('should call service and return fab on success', async () => {
      const mockFabId = '1';
      const mockFab = { id: 1, name: 'FabA' };
      mockReq.query = { id: mockFabId };
      mockGetFab.mockResolvedValue(mockFab);

      await getFabController(mockReq, mockRes);

      expect(fabService.getFab).toHaveBeenCalledTimes(1);
      expect(fabService.getFab).toHaveBeenCalledWith(mockFabId);
      expect(mockRes.status).toHaveBeenCalledWith(200);
      // expect(mockRes.json).toHaveBeenCalledWith(mockFab);
    });

    it('should throw error if service fails', async () => {
      const mockFabId = '1';
      mockReq.query = { id: mockFabId };
      mockGetFab.mockRejectedValue(new Error('Service failed'));

      await expect(getFabController(mockReq, mockRes)).rejects.toThrow('Service failed');
    });
  });

  // --- createFabController ---
  describe('createFabController', () => {
    it('should return 400 if name is missing', async () => {
      // await createFabController({ ...mockReq, body: { name: 'FabC' } }, mockRes); // Missing roomNum
      await expect(createFabController({ ...mockReq, body: {} }, mockRes)).rejects.toThrow('Name is required');
      // expect(mockRes.status).toHaveBeenCalledWith(400);
      // expect(mockRes.json).toHaveBeenCalledWith({ error: 'Name and roomNum are required' });
      expect(fabService.createFab).not.toHaveBeenCalled();

      jest.clearAllMocks(); // Reset for next check

      // await createFabController({ ...mockReq, body: { roomNum: 5 } }, mockRes); // Missing name
      // expect(mockRes.status).toHaveBeenCalledWith(400);
      // expect(fabService.createFab).not.toHaveBeenCalled();
    });

    it('should call service and return created fab on success', async () => {
      const mockName = 'FabC';
      const mockCreatedFab = { id: 3 };
      mockReq.body = { name: mockName };
      mockCreateFab.mockResolvedValue(mockCreatedFab);

      await createFabController(mockReq, mockRes);

      expect(fabService.createFab).toHaveBeenCalledTimes(1);
      expect(fabService.createFab).toHaveBeenCalledWith(mockName);
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith({ data: mockCreatedFab, message: 'Created' });
    });
    it('should throw error if service fails', async () => {
      const mockName = 'FabC';
      mockReq.body = { name: mockName };
      mockCreateFab.mockRejectedValue(new Error('Service failed'));

      await expect(createFabController(mockReq, mockRes)).rejects.toThrow('Service failed');
    });
  });

  // --- updateFabController ---
  describe('updateFabController', () => {
    it('should return 400 if id, name, or roomNum is missing', async () => {
      const baseBody = { id: 1, name: 'Updated', roomNum: 10 };
      await expect(updateFabController({ ...mockReq, body: { name: baseBody.name, roomNum: baseBody.roomNum } }, mockRes)).rejects.toThrow(
        'ID, name and roomNum are required',
      );
      // await updateFabController({ ...mockReq, body: { name: baseBody.name, roomNum: baseBody.roomNum } }, mockRes);
      // expect(mockRes.status).toHaveBeenCalledWith(400);
      // expect(mockRes.json).toHaveBeenCalledWith({ error: 'ID, name and roomNum are required' });
      expect(fabService.updateFab).not.toHaveBeenCalled();
      jest.clearAllMocks();

      // await updateFabController({ ...mockReq, body: { id: baseBody.id, roomNum: baseBody.roomNum } }, mockRes);
      // expect(mockRes.status).toHaveBeenCalledWith(400);
      // expect(mockRes.json).toHaveBeenCalledWith({ error: 'ID, name and roomNum are required' });
      // expect(fabService.updateFab).not.toHaveBeenCalled();
      // jest.clearAllMocks();

      // await updateFabController({ ...mockReq, body: { id: baseBody.id, name: baseBody.name } }, mockRes);
      // expect(mockRes.status).toHaveBeenCalledWith(400);
      // expect(mockRes.json).toHaveBeenCalledWith({ error: 'ID, name and roomNum are required' });
      // expect(fabService.updateFab).not.toHaveBeenCalled();
    });

    it('should call service and return updated fab on success', async () => {
      const mockId = 1;
      const mockName = 'UpdatedFab';
      const mockRoomNum = 8;
      // const mockUpdatedFab = { id: mockId, name: mockName, roomnum: mockRoomNum };
      mockReq.body = { id: mockId, name: mockName, roomNum: mockRoomNum };
      // mockUpdateFab.mockResolvedValue(mockUpdatedFab);

      await updateFabController(mockReq, mockRes);

      expect(fabService.updateFab).toHaveBeenCalledTimes(1);
      expect(fabService.updateFab).toHaveBeenCalledWith(mockId, mockName, mockRoomNum);
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'Updated' });
    });

    it('should throw error if service fails', async () => {
      const mockId = 1;
      const mockName = 'UpdatedFab';
      const mockRoomNum = 8;
      mockReq.body = { id: mockId, name: mockName, roomNum: mockRoomNum };
      mockUpdateFab.mockRejectedValue(new Error('Service failed'));

      await expect(updateFabController(mockReq, mockRes)).rejects.toThrow('Service failed');
    });
  });

  // --- deleteFabController ---
  describe('deleteFabController', () => {
    it('should return 400 if name is missing', async () => {
      mockReq.body = {};
      await expect(deleteFabController(mockReq, mockRes)).rejects.toThrow('Name is required');
      // await deleteFabController(mockReq, mockRes);

      expect(fabService.deleteFab).not.toHaveBeenCalled();
      // expect(mockRes.status).toHaveBeenCalledWith(400);
      // expect(mockRes.json).toHaveBeenCalledWith({ error: 'Name is required' });
    });

    it('should call service and return deleted fab on success', async () => {
      const mockName = 'ToDeleteFab';
      // const mockDeletedFab = { id: 5, name: mockName, roomnum: 2 };
      mockReq.body = { name: mockName };
      // mockDeleteFab.mockResolvedValue(mockDeletedFab);

      await deleteFabController(mockReq, mockRes);

      expect(fabService.deleteFab).toHaveBeenCalledTimes(1);
      expect(fabService.deleteFab).toHaveBeenCalledWith(mockName);
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'Deleted' });
    });

    it('should throw error if service fails', async () => {
      const mockName = 'ToDeleteFab';
      mockReq.body = { name: mockName };
      mockDeleteFab.mockRejectedValue(new Error('Service failed'));
      await expect(deleteFabController(mockReq, mockRes)).rejects.toThrow('Service failed');
    });
  });
});
