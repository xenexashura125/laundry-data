const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');

// POST
router.post('/login', userController.login);
router.post('/sign-up', userController.signUp);
router.post('/forgot-password', userController.forgotPassword);
router.post('/reset-password/:id', userController.resetPassword);
router.post('/update-password', userController.updatePassword);

// GET
router.get('/get-all', userController.getAll);
router.get('/get-by-id/:id', userController.getById);

// PUT
router.put('/update-by-id/:id', userController.updateById);
// Add this route to user.routes.js
router.post('/getUserByToken', userController.getUserByToken);

// DELETE
router.delete('/delete-by-id/:id', userController.deleteById);
router.delete('/delete-all', userController.deleteAll);

module.exports = router;