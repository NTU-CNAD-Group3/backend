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

# Api


- `/api/admin/getAllFabs`: Get all fabs information
- `/api/admin/getFab`:  Get a fab information with name
- `/api/admin/createFab`:  Create a fab with name and roomNum
- `/api/admin/updateFab`: Update a fab's name and roomNum with id
- `/api/admin/deleteFab`:  Delete a fab with name
