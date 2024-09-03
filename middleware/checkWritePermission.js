//middleware/checkWritePermission
const fs = require('fs');
const path = require('path');

const checkWritePermission = (directory) => {
    return (req, res, next) => {
        const testFile = path.join(directory, `test-write-permission-${Date.now()}.txt`);
        
        fs.writeFile(testFile, 'Test d\'écriture', (writeErr) => {
            if (writeErr) {
                console.error(`Erreur d'écriture dans ${directory}:`, writeErr);
                return res.status(500).json({ error: 'Erreur serveur : problème de permissions d\'écriture' });
            }
            
            fs.unlink(testFile, (unlinkErr) => {
                if (unlinkErr) {
                    console.error(`Erreur lors de la suppression du fichier test dans ${directory}:`, unlinkErr);
                    
                }
                
                console.log(`Vérification des droits d'écriture réussie dans ${directory}`);
                next(); 
            });
        });
    };
};

module.exports = checkWritePermission;