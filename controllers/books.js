//controllers/books
const Book = require('../models/book');
const fs = require('fs').promises;
const sharp = require('sharp');
const path = require('path');

// POST - CREATE
exports.createBook = (req, res) => {
    console.log('Contenu de req.file:', JSON.stringify(req.file, null, 2));
    let bookData;
    try {
        bookData = JSON.parse(req.body.book);
    } catch (error) {
        console.error('Erreur lors du parsing du JSON :', error);
        return res.status(400).json({ error: 'Invalid JSON' });
    }
    if (!bookData.title || !bookData.author || !bookData.year || !bookData.genre || !bookData.ratings) {
        console.error('Données manquantes :', { bookData });
        return res.status(400).json({ error: 'Missing required fields' });
    }
    if (!req.file) {
        console.error('Aucun fichier n\'a été uploadé');
        return res.status(400).json({ error: 'No file uploaded' });
    }
    const filename = `${Date.now()}-${Math.round(Math.random() * 1E9)}.webp`;
    const sharpenedFile = `images/${filename}`;
    sharp(req.file.buffer)
        .resize(300)
        .toFormat('webp')
        .toFile(sharpenedFile)
        .then(info => {
            console.log('Image traitée avec succès :', info);
            const book = new Book({
                userId: req.auth.userId,
                title: bookData.title,
                author: bookData.author,
                imageUrl: `${req.protocol}://${req.get('host')}/${sharpenedFile}`,
                year: parseInt(bookData.year, 10),
                genre: bookData.genre,
                ratings: bookData.ratings,
                averageRating: bookData.averageRating 
            });
            return book.save();
        })
        .then(() => {
            console.log('Livre enregistré avec succès');
            res.status(201).json({ message: 'Livre enregistré !' });
        })
        .catch(error => {
            console.error('Erreur lors du traitement ou de l\'enregistrement :', error);
            res.status(500).json({ error: error.message });
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
exports.modifyBook = async (req, res) => {
  try {
    let bookData = req.body.book ? JSON.parse(req.body.book) : req.body;
    const existingBook = await Book.findOne({ _id: req.params.id });
    if (!existingBook) {
      return res.status(404).json({ error: "Book not found" });
    }
    if (existingBook.userId != req.auth.userId) {
      return res.status(403).json({ error: "Unauthorized request" });
    }
    let updatedImageUrl = existingBook.imageUrl;
    if (req.file) {
      const filename = `${Date.now()}-${Math.round(Math.random() * 1E9)}.webp`;
      const sharpenedFile = `images/${filename}`;
      await sharp(req.file.buffer)
        .resize(300)
        .toFormat('webp')
        .toFile(sharpenedFile);
      updatedImageUrl = `${req.protocol}://${req.get('host')}/${sharpenedFile}`;
      const oldFilename = existingBook.imageUrl.split('/images/')[1];
      try {
        await fs.unlink(`images/${oldFilename}`);
      } catch (err) {
        console.error("Error deleting old image:", err);
      }
    }
    const updatedBook = {
      userId: req.auth.userId,
      title: bookData.title || existingBook.title,
      author: bookData.author || existingBook.author,
      imageUrl: updatedImageUrl,
      year: bookData.year ? parseInt(bookData.year, 10) : existingBook.year,
      genre: bookData.genre || existingBook.genre,
      ratings: existingBook.ratings,
      averageRating: existingBook.averageRating
    };
    await Book.updateOne({ _id: req.params.id }, updatedBook);
    res.status(200).json({ message: 'Livre modifié !' });
  } catch (error) {
    console.error('Erreur lors de la modification du livre:', error);
    res.status(500).json({ error: error.message });
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
    

    if (!userId || rating === undefined) {
        return res.status(400).json({ error: "UserId et rating sont requis." });
    }

    const grade = parseInt(rating, 10);
    if (isNaN(grade) || grade < 0 || grade > 5) {
        return res.status(400).json({ error: "La note doit être un nombre entre 0 et 5." });
    }

    Book.findOne({ _id: bookId })
        .then(book => {
            if (!book) {
                return res.status(404).json({ error: "Livre non trouvé." });
            }

            const existingRatingIndex = book.ratings.findIndex(r => r.userId === userId);
            if (existingRatingIndex !== -1) {
                return res.status(400).json({ error: "Vous avez déjà noté ce livre." });
            }
            book.ratings.push({ userId, grade });
            const sum = book.ratings.reduce((acc, curr) => acc + curr.grade, 0);
            book.averageRating = Number((sum / book.ratings.length).toFixed(3));
            return book.save();
        })
        .then(updatedBook => res.status(200).json(updatedBook))
        .catch(error => {
            console.error("Erreur lors de l'ajout de la note:", error);
            res.status(500).json({ error: "Une erreur est survenue lors de l'ajout de la note." });
        });
};

// GET ALL
exports.getAllBooks = (req, res) => {
  Book.find()
    .then(books => res.status(200).json(books))
    .catch(error => res.status(400).json({ error }));
};
