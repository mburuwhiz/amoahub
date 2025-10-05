import express from 'express';
const router = express.Router();

// @desc    Landing page
// @route   GET /
router.get('/', (req, res) => {
  res.render('landing_v3', {
    title: 'Welcome to Amora Hub',
    layout: 'layouts/main'
  });
});

export default router;