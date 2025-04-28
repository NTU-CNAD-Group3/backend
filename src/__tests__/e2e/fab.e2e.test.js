import request from 'supertest';
import dotenv from 'dotenv';
import { app, server } from '../../index.js';
import { jest } from '@jest/globals';
import { databaseClose } from '#src/models/db.js';

dotenv.config();

const admin = '/api/admin';
const user = '/api/user';

jest.setTimeout(20_000);

describe('Fab full life‑cycle (Supertest)', () => {
  test('清空資料庫', async () => {
    await request(app).get(`${admin}/clearDatabase`).expect(200);
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

    const res = await request(app).post(`${admin}/createFab`).send(payload).expect(201);
    const { fab, rooms } = res.body;

    expect(fab.name).toBe('Fab 1');
    expect(fab.roomnum).toBe(2);
    expect(rooms).toHaveLength(2);
    expect(rooms[0]).toMatchObject({ name: 'Room 1', racknum: 5, height: 10 });
    expect(rooms[1]).toMatchObject({ name: 'Room 2', racknum: 3, height: 8 });
  });

  test('新增 Rack', async () => {
    const payload = {
      name: 'Rack 1',
      roomId: 1,
      fabId: 1,
      service: 'any',
      height: 8,
    };

    await request(app).post(`${admin}/addRack`).send(payload).expect(201);
  });

  test('查詢 Fab', async () => {
    const res = await request(app).get(`${admin}/watchFab`).query({ name: 'Fab 1' }).expect(200);
    expect(res.body).toHaveLength(2);
    expect(res.body[0].fabname).toBe('Fab 1');
    expect(res.body[1].fabname).toBe('Fab 1');
  });

  test('建立 IP Pool', async () => {
    const payload = {
      service: 'any',
      cidrBlock: '10.0.1.0/24',
    };

    await request(app).post(`${user}/createIpPool`).send(payload).expect(201);
  });

  test('使用者新增 Server', async () => {
    const payload = {
      name: 'Host 1',
      service: 'any',
      unit: 1,
      fabId: 1,
      roomId: 1,
      rackId: 1,
      frontPosition: 0,
      backPosition: 1,
    };

    await request(app).post(`${user}/addServer`).send(payload).expect(201);
  });
});

afterAll(async () => {
  await server.close();
  await databaseClose();
});
