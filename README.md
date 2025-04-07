# Gateway Service

## Description

The Backend service contains the primary logic of the application. It is responsible for handling fab, rack, and server management. 

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
- `/api/admin/addRack`: Create rack in room but without IP service now
- `/api/admin/clearDatabase`: You can use this to recreate db to clear the data or if you do some changes of table definitions


### how to test 


- `curl -X GET "http://localhost:8000/api/admin/watchFab?name=Fab%201"`
- `curl -X POST http://localhost:8000/api/admin/createFab  -H "Content-Type: application/json" -d '{ "name":"Fab 1", "roomNum": 2, "rooms": [{"name":"Room 1","rackNum": 5, "height": 10},{"name": "Room 2", "rackNum": 3, "height": 8}]}'`
- `curl -X POST http://localhost:8000/api/admin/addRack  -H "Content-Type: application/json" -d '{ "name":"Rack 1", "roomId": 1, "fabId": 1, "service": "any", "height": 8 }'`
- `curl -X GET "http://localhost:8000/api/admin/clearDatabase"`