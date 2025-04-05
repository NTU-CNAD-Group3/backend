import express from 'express';

const router = express.Router();

router.get('/healthy', (req, res) => {
  res.send('Auth service is healthy.');
});

export default router;
