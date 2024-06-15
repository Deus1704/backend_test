const fs = require('fs');
const path = require('path');

export default (req, res) => {
    const dataPath = path.join(__dirname, '..', 'data', 'data.json');
    fs.readFile(dataPath, 'utf-8', (err, data) =>{
        if (err) {
            res.status(500).json({error : 'Failed to read the data'});
            return ;
        }
        res.status(200).json(JSON.parse(data));
    })
}
