const express = require('express');
const router = express.Router();
const jobController = require('../controllers/jobController');

router.get('/stats', jobController.getStats);
router.get('/', jobController.getJobs);
router.get('/:id', jobController.getJob);
router.post('/', jobController.createJob);
router.patch('/:id', jobController.updateJob);
router.delete('/:id', jobController.deleteJob);

module.exports = router;