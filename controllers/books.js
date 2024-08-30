//controllers/books
const Book = require('../models/book');
const fs = require('fs');

// POST - CREATE
exports.createBook = (req, res) => {
    let bookData;
    try {
        bookData = JSON.parse(req.body.book);
    } catch (error) {
        return res.status(400).json({ error });
    }
    if (!bookData.title || !bookData.author|| !req.file || !bookData.year || !bookData.genre || !bookData.ratings) {
        return res.status(400).json({ error });
    }
    const book = new Book({
        userId: req.auth.userId,
        title: bookData.title,
        author: bookData.author,
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
        year: parseInt(bookData.year, 10),
        genre: bookData.genre,
        ratings: bookData.ratings,
        averageRating: bookData.averageRating || bookData.ratings
    });
    book.save()
        .then(() => res.status(201).json({ message: 'Livre enregistré !' }))
        .catch(error => {
            res.status(400).json({ error });
        });
};

// GET ID - READ
exports.getOneBook = (req, res) => {
  Book.findOne({ _id: req.params.id })
    .then(book => {
      if (!book) {
        return res.status(404).json({error});
      }
      res.status(200).json(book);
    })
    .catch(error => res.status(500).json({ error }));
};

// PUT - UPDATE
exports.modifyBook = (req, res) => {
  bookData = JSON.parse(req.body.book);
  const book = new Book({
    userId: req.auth.userId,
    title: bookData.title,
    author: bookData.author,
    imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
    year: parseInt(bookData.year, 10),
    genre: bookData.genre,
    ratings: bookData.ratings,
    averageRating: bookData.averageRating
  });
  if (thing.userId != req.auth.userId) {
               res.status(401).json({error});
           } else {
				Book.updateOne({ _id: req.params.id }, book)
				.then(() => res.status(200).json({ message: 'Livre modifié !' }))
				.catch(error => res.status(400).json({ error }));
				}
};

// DELETE
exports.deleteBook = (req, res) => {

   Book.findOne({ _id: req.params.id})
       .then(book => {
           if (book.userId != req.auth.userId) {
               res.status(401).json({message: 'Not authorized'});
           } else {
               const filename = thing.imageUrl.split('/images/')[1];
               fs.unlink(`images/${filename}`, () => {
					Book.deleteOne({ _id: req.params.id })
						.then(() => res.status(200).json({ message: 'Objet supprimé !' }))
						.catch(error => res.status(401).json({ error }));
               });
           }
       })
       .catch( error => {
           res.status(500).json({ error });
       });
};

// GET BEST RATED BOOKS
exports.getBestRatedBooks = (req, res) => {
    Book.find()
        .sort({ averageRating: -1 }) 
        .limit(3) 
        .then(books => res.status(200).json(books))
        .catch(error => res.status(500).json({ error }));
};

// POST ID RATING
exports.addRating = (req, res) => {
    const { userId, rating } = req.body;
    const bookId = req.params.id;
    const grade = parseInt(rating, 10);

    Book.findOne({ _id: bookId })
        .then(book => {
            if (!book) {
                return res.status(404).json({ error });
            }

            // Vérifier si l'utilisateur a déjà noté ce livre
            const existingRatingIndex = book.ratings.findIndex(r => r.userId === userId);
            if (existingRatingIndex !== -1) {
                return res.status(400).json({ error });
            }

            // Ajouter la nouvelle note
            book.ratings.push({ userId, grade });

            // Recalculer la note moyenne
            const sum = book.ratings.reduce((acc, curr) => acc + curr.grade, 0);
            book.averageRating = sum / book.ratings.length;

            return book.save();
        })
        .then(updatedBook => res.status(200).json(updatedBook))
        .catch(error => {
            res.status(500).json({ error });
        });
};

// GET ALL
exports.getAllBooks = (req, res) => {
  Book.find()
    .then(books => res.status(200).json(books))
    .catch(error => res.status(400).json({ error }));
};
