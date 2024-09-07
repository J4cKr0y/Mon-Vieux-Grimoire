const processImage = async (req, res, next) => {
  if (req.file) {
    try {
      req.imageUrl = `${req.protocol}://${req.get('host')}/${await processImage(req.file.buffer)}`;
      next();
    } catch (error) {
      res.status(500).json({ error: 'Error processing image' });
    }
  } else {
    next();
  }
};

module.exports = processImage;
