# Gateway Service

# 大部分測試完成可以再檢查

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


## Endpoints

|             Endpoint              | Method |           Description            |
|:---------------------------------:|:------:|:--------------------------------:|
|           /api/healthy            |  Get   | Check if the service is running. |
|             /api/fab              |  POST  |      create fab with name        |
|             /api/fab              |  PUT   |  Update fab with id,name         |
|             /api/fab              | DELETE |      delete fab with name        |
|             /api/fab              |  GET   |      get fab details with id     |
|            /api/fab/allFabs       |  GET   |      get visual information      |
|             /api/room             |  POST  |create rooms with fname,num,array |
|             /api/room             |  PUT   | Update room with id,name,rackNum |
|             /api/room             | DELETE |      delete room with name,id    |
|             /api/room             |  GET   |  get room details with name,id   |
|             /api/rack             |  POST  |create racks with fname,num,array |
|             /api/rack             |  PUT   | Update rack with id,name         |
|             /api/rack             | DELETE |      delete rack with r/rk,id    |
|             /api/rack             |  GET   |    get rack with name,r/rkid     |
|             /api/server           |  POST  |    create a server               |
|             /api/server           |  PUT   |    Move a server                 |
|             /api/server           | DELETE |    Delete a server by id         |
|    /api/server/repair             |  PUT   |     set server healthy           |
|    /api/server/broken             |  PUT   |    set server not healthy        |
|    /api/server/name               |  PUT   |       Update serve name          |
|             /api/server           |  GET   |    Get a server by id            |
|             /api/server/AllServers|  GET   |   Get all servers                |
|             /api/server/searching |  GET   |    Get a server searching        |
|    /api/server/allBrokenServers   |  GET   | Get all servers broken           |
|             /api/ip/pool          |  POST  |    create a ip pool              |
|             /api/ip/pool          |  GET   |    Get a ippool by id            |
|             /api/ip/allIp         |  GET   |   Get all service ip             |
|             /api/ip/usedIp        |  GET   |    Get ips which are used        |
|    /api/server/allPools           |  GET   | Get all ippools                  |

