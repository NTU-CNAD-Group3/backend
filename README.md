# Gateway Service

## Description

The Backend service contains the primary logic of the application. It is responsible for handling fab, rack, and server management. 

## 剩下要做的
整理一下目前架構(包含Route、身分驗證)
gateway
Unit test

## Prerequisites

```bash
# Install dependencies
npm install

## Copy the .env.development file and rename it to .env
cp .env.development .env
```

## Scripts

- `npm start`: Start the service in production mode.
- `npm run dev`: Start the service in development mode.
- `npm run test`: Run the tests.
- `npm run lint`: Lint the code.
- `npm run format`: Format the code.

## API


- `/api/admin/watchFab?name=Fab`: Print the Fab information
- `/api/admin/createFab`: Create fab with rooms
- `/api/admin/addRack`: Create rack in room 
- `/api/admin/clearDatabase`: You can use this to recreate db to clear the data or if you do some changes of table definitions
- `/api/user/addServer`: Add server and give ip to server

### how to test 

- `npm run test:e2e`
- `curl -X GET "http://localhost:8000/api/admin/watchFab?name=Fab%201"`
- `curl -X GET "http://localhost:8000/api/admin/clearDatabase"`
- `curl -X POST http://localhost:8000/api/admin/createFab  -H "Content-Type: application/json" -d '{ "name":"Fab 1", "roomNum": 2, "rooms": [{"name":"Room 1","rackNum": 5, "height": 10},{"name": "Room 2", "rackNum": 3, "height": 8}]}'`
- `curl -X POST http://localhost:8000/api/admin/addRack  -H "Content-Type: application/json" -d '{ "name":"Rack 1", "roomId": 1, "fabId": 1, "service": "any", "height": 8 }'`
- `curl -X POST http://localhost:8000/api/user/createIpPool -H "Content-Type: application/json" -d '{ "service": "any", "cidrBlock": "10.1.1.0/24" }'`
- `curl -X POST http://localhost:8000/api/user/addServer  -H "Content-Type: application/json" -d '{ "name":"Host 1", "service": "any", "unit": 1, "fabId": 1, "roomId": 1,"rackId": 1, "frontPosition":0, "backPosition":1 }'`
- `curl -X DELETE http://localhost:8000/api/user/deleteServer  -H "Content-Type: application/json" -d '{ "id": 1 }'`
