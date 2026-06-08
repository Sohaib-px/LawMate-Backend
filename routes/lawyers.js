const express = require('express');
const router = express.Router();
const lawyerController = require('../controllers/lawyerController');

router.get('/', lawyerController.getLawyers);
router.get('/social-workers', lawyerController.getSocialWorkers);

module.exports = router;
