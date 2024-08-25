const express = require('express');
const app = express();
const mongoose = require('mongoose');
const z_mongodb = require('./z_mongodb.js');
app.use(express.json());

mongoose.connect(z_mongodb.mongodbURI,{})
  .then(() => console.log('Connexion à MongoDB réussie !'))
  .catch(() => console.log('Connexion à MongoDB échouée !'));


//Middleware ajoutant les header pour éviter l'erreur CORS (Cross Origin Resource Sharing) 
app.use((req, res, next) => {
	//accéder à notre API depuis n'importe quelle origine
  res.setHeader('Access-Control-Allow-Origin', '*');
    //ajoute les headers mentionnés aux requêtes envoyées vers notre API
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
    //envoyer des requêtes avec les méthodes mentionnées
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  next();
});

//Middleware POST books
app.post('/api/books', (req, res, next) => {
  console.log(req.body);
  res.status(201).json({
    message: 'Objet créé !'
  });
});

app.get('/api/users', (req, res, next) => {
  const users = [
    {
	  email: 'sophie.bluel@test.tld',
	  password: 'S0phie',
	  userId: 'a1b2c3d4e5f6789012345678',
	  token: '',
	},
	{
	  email: 'nomail@yopmail.com',
	  password: 'C7ejsUidAGD6NCct',
	  userId: '60d5f9e8c9a1b2001a2e4f3c',
	  token: '',
	}
  ];
  res.status(300).json(users);
});


//Middleware GET books
app.get('/api/books', (req, res, next) => {
  const books = [
    {
	  userId: 'a1b2c3d4e5f6789012345678',
      title: 'L`hisoire sans fin',
	  author: 'Michael Ende',
      imageUrl: 'https://f.media-amazon.com/images/I/71FXt0UoAlL._SY466_.jpg',
	  year: '2014',
	  genre: 'Jeunesse',
	  ratings : [
		{
		userId : '5f47ac10b58c1e001c8d4b6a',
		grade : '5',
		}
	  ],
	  averageRating : '5',
    },
    {
      userId: '60d5f9e8c9a1b2001a2e4f3c',
      title: 'Second Oekumene, tome 4: Vatican',
	  author: 'John Crossford',
	  imageUrl: 'https://f.media-amazon.com/images/I/71RaAJ27WIL._SY466_.jpg',
	  year: '2023',
	  genre: 'Science-fiction',
	  ratings : [
		{
		userId : 'b2c3d4e5f678901234567890',
		grade : '4.8',
		}
	  ],
	  averageRating : '4.5',
    },
  ];
  res.status(200).json(books);
});

module.exports = app;