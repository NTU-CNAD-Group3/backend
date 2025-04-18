# Gateway Service

## Description

The Backend service contains the primary logic of the application. It is responsible for handling fab, rack, and server management. 

## 已有

* 取得DC(Fab)裡所有物件
* 建立Fab、room、rack、server
* IP pool

## 可以快速做的但還沒做功能

* 刪除、更新各種資料的api
* 找查資料的api

## 尚缺的功能

* server 在rack位置控管
* IP 用盡擴充
* 與gateway接口
* Unit test
* 監控是否IP用盡、空間用盡
* 以關鍵字查詢server、service

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


- `curl -X GET "http://localhost:8000/api/admin/watchFab?name=Fab%201"`
- `curl -X POST http://localhost:8000/api/admin/createFab  -H "Content-Type: application/json" -d '{ "name":"Fab 1", "roomNum": 2, "rooms": [{"name":"Room 1","rackNum": 5, "height": 10},{"name": "Room 2", "rackNum": 3, "height": 8}]}'`
- `curl -X POST http://localhost:8000/api/admin/addRack  -H "Content-Type: application/json" -d '{ "name":"Rack 1", "roomId": 1, "fabId": 1, "service": "any", "height": 8 }'`
- `curl -X GET "http://localhost:8000/api/admin/clearDatabase"`
- `curl -X POST http://localhost:8001/api/user/addServer  -H "Content-Type: application/json" -d '{ "name":"Host 1", "roomId": 1, "fabId": 1,"rackId": 1, "service": "any", "unit": 1 }'`