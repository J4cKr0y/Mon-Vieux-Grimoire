//middleware/checkWritePermission
const fs = require('fs');
const path = require('path');

const checkWritePermission = (directory) => {
    return (req, res, next) => {
//console.log(`checkWritePermission in ${directory}`);
        const testFile = path.join(directory, `test-write-permission-${Date.now()}.txt`);
        
        fs.writeFile(testFile, 'Writing test', (writeErr) => {
            if (writeErr) {
                console.error(`Writing error in ${directory}:`, writeErr);
                return res.status(500).json({ error: 'Server Error: Write permissions problem' });
            }
            
            fs.unlink(testFile, (unlinkErr) => {
                if (unlinkErr) {
                    console.error(`Error deleting test file in ${directory}:`, unlinkErr);
                    
                }
                
                //console.log(`Write permissions check successful in ${directory}`);
                next(); 
            });
        });
    };
};

module.exports = checkWritePermission;