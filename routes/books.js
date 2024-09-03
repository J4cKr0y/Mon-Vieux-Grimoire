//route/books
const express = require('express');
const router = express.Router();
const booksCtrl = require('../controllers/books');
const auth = require('../middleware/auth');
const multer = require('../middleware/multer-config');

// GET books best rated
router.get('/bestrating', booksCtrl.getBestRatedBooks);
// POST books id rating
router.post('/:id/rating', auth, booksCtrl.addRating);

// POST books - CREATE
router.post('/', auth, multer, booksCtrl.createBook);
// GET books id - READ
router.get('/:id', booksCtrl.getOneBook);
// PUT books id - UPDATE
router.put('/:id', auth, multer, booksCtrl.modifyBook);
// DELETE books id - DELETE
router.delete('/:id', auth, booksCtrl.deleteBook);

// GET all books
router.get('/', booksCtrl.getAllBooks);

module.exports = router;