// require axios
const axios = require('axios');

const admin = 'http://localhost:8000/api/admin';
const user = 'http://localhost:8001/api/user';

describe('Fab full life‑cycle', () => {
  // Jest 預設 5s 可能不夠，拉長一點
  jest.setTimeout(20_000);

  test('清空資料庫', async () => {
    const { status } = await axios.get(`${admin}/clearDatabase`);
    expect(status).toBe(200);
  });

  test('建立 Fab 與 Room', async () => {
    const payload = {
      name: 'Fab 1',
      roomNum: 2,
      rooms: [
        { name: 'Room 1', rackNum: 5, height: 10 },
        { name: 'Room 2', rackNum: 3, height: 8 },
      ],
    };
    const { status, data } = await axios.post(`${admin}/createFab`, payload);
    expect(status).toBe(201);
    const { fab, rooms } = data;
    expect(fab.name).toBe('Fab 1');
    expect(fab.roomnum).toBe(2);
    expect(rooms.length).toBe(2);
    expect(rooms[0].name).toBe('Room 1');
    expect(rooms[0].racknum).toBe(5);
    expect(rooms[0].height).toBe(10);
    expect(rooms[1].name).toBe('Room 2');
    expect(rooms[1].racknum).toBe(3);
    expect(rooms[1].height).toBe(8);
  });

  test('新增 Rack', async () => {
    const payload = {
      name: 'Rack 1',
      roomId: 1,
      fabId: 1,
      service: 'any',
      height: 8,
    };
    const { status } = await axios.post(`${admin}/addRack`, payload);
    expect(status).toBe(201);
  });

  test('查詢 Fab', async () => {
    const { status, data } = await axios.get(`${admin}/watchFab`, {
      params: { name: 'Fab 1' },
    });
    expect(status).toBe(200);
    expect(data.length).toBe(2);
    expect(data[0].fabname).toBe('Fab 1');
    expect(data[1].fabname).toBe('Fab 1');
  });

  test('使用者新增 Server', async () => {
    const payload = {
      name: 'Host 1',
      roomId: 1,
      fabId: 1,
      rackId: 1,
      service: 'any',
      unit: 1,
    };
    const { status } = await axios.post(`${user}/addServer`, payload);
    expect(status).toBe(201);
  });
});
