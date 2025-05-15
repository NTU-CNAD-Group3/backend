import { jest } from '@jest/globals';

const mockQuery = jest.fn();
const mockLoggerInfo = jest.fn();
const mockLoggerError = jest.fn();

await jest.unstable_mockModule('#src/models/db.js', () => ({
  pool: { query: mockQuery }
}));

await jest.unstable_mockModule('#src/utils/logger.js', () => ({
  default: {
    info: mockLoggerInfo,
    error: mockLoggerError
  }
}));

const fabServiceModule = await import('#src/services/fab.service.js');
const fabService = fabServiceModule.default;

beforeEach(() => {
  jest.clearAllMocks();
});

// -----------------------------------------------------------------------------
// getFab
// -----------------------------------------------------------------------------
describe('getFab', () => {
  test('should return nested fab structure if found', async () => {
    mockQuery
      .mockResolvedValueOnce({ rows: [{ exists: true }] }) // exists check
      .mockResolvedValueOnce({
        rows: [
          {
            dc_id: 1, dc_name: 'fabA', createdat: '2024-01-01', updatedat: '2024-01-02',
            room_id: 2, room_name: 'room1',
            rack_id: 3, rack_name: 'rack1', service: 'web',
            server_id: 4, server_name: 'server1'
          }
        ]
      });

    const result = await fabService.getFab('fabA');

    expect(result.name).toBe('fabA');
    expect(mockQuery).toHaveBeenCalledTimes(2);
    expect(mockLoggerInfo).toHaveBeenCalledWith({ message: 'msg=Fab get' });
  });

  test('should throw 404 if fab not found', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [{ exists: false }] });

    await expect(fabService.getFab('notFound')).rejects.toThrow('DC not found');
    expect(mockLoggerError).toHaveBeenCalledWith({ message: 'msg=Fab not found' });
  });
});

// -----------------------------------------------------------------------------
// getAllFabs
// -----------------------------------------------------------------------------
describe('getAllFabs', () => {
  test('should return all fabs nested', async () => {
    mockQuery.mockResolvedValueOnce({
      rows: [
        {
          dc_id: 1, dc_name: 'fabA',
          room_id: 2, room_name: 'room1',
          rack_id: 3, rack_name: 'rack1', service: 'db',
          server_id: 4, server_name: 's1', unit: 2, frontposition: 10, backposition: 20
        }
      ]
    });

    const result = await fabService.getAllFabs();

    expect(result.dc1.name).toBe('fabA');
    expect(mockLoggerInfo).toHaveBeenCalledWith({ message: 'msg=All fabs get' });
  });

  test('should return empty object if no rows', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [] });

    const result = await fabService.getAllFabs();
    expect(result).toEqual({});
  });
});

// -----------------------------------------------------------------------------
// createFab
// -----------------------------------------------------------------------------
describe('createFab', () => {
  test('should insert new fab and return id', async () => {
    mockQuery
      .mockResolvedValueOnce({ rows: [{ exists: false }] }) // uniqueness check
      .mockResolvedValueOnce({ rows: [{ id: 1 }] });        // insert

    const result = await fabService.createFab('fabX');
    expect(result).toEqual({ id: 1 });
    expect(mockQuery).toHaveBeenCalledTimes(2);
    expect(mockLoggerInfo).toHaveBeenCalledWith({ message: 'msg=Fab created name=fabX' });
  });

  test('should throw error if name already exists', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [{ exists: true }] });

    await expect(fabService.createFab('fabX')).rejects.toThrow('The name must be unique');
    expect(mockLoggerError).toHaveBeenCalled();
  });
});

// -----------------------------------------------------------------------------
// updateFab
// -----------------------------------------------------------------------------
describe('updateFab', () => {
  test('should update fab name if valid', async () => {
    mockQuery
      .mockResolvedValueOnce({ rows: [{ exists: true }] })  // id exists
      .mockResolvedValueOnce({ rows: [{ exists: false }] }); // name not taken

    await fabService.updateFab(1, 'newFab');
    expect(mockQuery).toHaveBeenCalledTimes(3);
    expect(mockLoggerInfo).toHaveBeenCalledWith({ message: 'msg=Fab updated name=newFab' });
  });

  test('should throw error if fab not found by id', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [{ exists: false }] });

    await expect(fabService.updateFab(99, 'x')).rejects.toThrow('DC not found');
    expect(mockLoggerError).toHaveBeenCalled();
  });

  test('should throw error if name already exists', async () => {
    mockQuery
      .mockResolvedValueOnce({ rows: [{ exists: true }] })
      .mockResolvedValueOnce({ rows: [{ exists: true }] });

    await expect(fabService.updateFab(1, 'duplicate')).rejects.toThrow('The name must be unique');
    expect(mockLoggerError).toHaveBeenCalled();
  });
});

// -----------------------------------------------------------------------------
// deleteFab
// -----------------------------------------------------------------------------
describe('deleteFab', () => {
  test('should delete fab if no rooms exist', async () => {
    mockQuery
      .mockResolvedValueOnce({ rows: [{ exists: true }] })  // fab exists
      .mockResolvedValueOnce({ rows: [{ id: 5 }] })         // get id
      .mockResolvedValueOnce({ rows: [{ exists: false }] }); // is empty

    await fabService.deleteFab('fabX');
    expect(mockQuery).toHaveBeenCalledTimes(4); // +1 for DELETE query
    expect(mockLoggerInfo).toHaveBeenCalled();
  });

  test('should throw error if fab not found', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [{ exists: false }] });

    await expect(fabService.deleteFab('notFound')).rejects.toThrow('The name does not exist');
    expect(mockLoggerError).toHaveBeenCalled();
  });

  test('should throw error if fab is not empty', async () => {
    mockQuery
      .mockResolvedValueOnce({ rows: [{ exists: true }] })
      .mockResolvedValueOnce({ rows: [{ id: 5 }] })
      .mockResolvedValueOnce({ rows: [{ exists: true }] });

    await expect(fabService.deleteFab('fabWithRooms')).rejects.toThrow('Fab is not Empty');
    expect(mockLoggerError).toHaveBeenCalled();
  });
});
