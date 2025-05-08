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

## Endpoints

|             Endpoint              | Method |           Description            |
|:---------------------------------:|:------:|:--------------------------------:|
|           /api/healthy            |  Get   | Check if the service is running. |
|             /api/fab              |  POST  |      create fab with name        |
|             /api/fab              |  PUT   |  Update fab with id,name,roomNum |
|             /api/fab              | DELETE |      delete fab with name        |
|             /api/fab              |  GET   |      get fab details with id     |
|            /api/fab/allFabs       |  GET   |      get visual information      |
|             /api/rooms            |  POST  |create rooms with fname,num,array |
|             /api/room             |  PUT   | Update room with id,name,rackNum |
|             /api/room             | DELETE |      delete room with name,id    |
|             /api/room             |  GET   |  get room details with name,id   |

