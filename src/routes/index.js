import express from 'express';

import AdminRoutes from '#src/routes/admin.js';

const router = express.Router();

router.get('/healthy', (req, res) => {
  res.send('Backend service is healthy.');
});

router.use('/admin', AdminRoutes);

export default router;
