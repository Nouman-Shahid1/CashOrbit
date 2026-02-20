const express = require('express');
const auth = require('../middleware/auth');
const { createTransaction, getTransactions, deleteTransaction } = require('../controllers/transactionController');

const router = express.Router();

// Create transaction
router.post('/', auth, createTransaction);

// Get transactions
router.get('/', auth, getTransactions);

// Delete transaction
router.delete('/:id', auth, deleteTransaction);

module.exports = router;