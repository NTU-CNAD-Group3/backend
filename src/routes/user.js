import express from 'express';

import userController from '#src/controllers/user.controller.js';

const router = express.Router();

router.post('/addServer', userController.addServer);

export default router;
