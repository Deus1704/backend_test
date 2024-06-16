const fs = require('fs');
const path = require('path');
const cors = require('cors');
const express = require('express');
const bodyParser = require('body-parser');

const app = express();

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*'); // Allow all origins or specify your frontend's origin
    res.header('Access-Control-Allow-Methods', 'GET,HEAD,OPTIONS,POST,PUT');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    next();
  });
  
app.use(bodyParser.json());

const PORT = process.env.PORT || 3000;
const dataPath = path.join(__dirname, '..', 'data', 'data.json');

// Temporary data path for testing write permissions
const tmpDataPath = path.join('/tmp', 'data.json');

// Function to get the correct data path based on environment
const getDataPath = () => {
    return process.env.NODE_ENV === 'production' ? tmpDataPath : dataPath;
};

// Initialize /tmp/data.json with existing data (if needed)
const initializeTmpDataPath = () => {
    if (process.env.NODE_ENV === 'production') {
        fs.copyFile(dataPath, tmpDataPath, (err) => {
            if (err) {
                console.error('Error initializing tmp data file:', err);
            } else {
                console.log('tmp data file initialized');
            }
        });
    }
};

// Call the initialization function
initializeTmpDataPath();

// GET METHODS:
app.get('/getallData', (req, res) => {
    fs.readFile(getDataPath(), 'utf8', (err, data) => {
        if (err) {
            console.error('Read file error:', err);
            res.status(500).send('An error occurred while reading the file. Please try again later.');
            return;
        }
        try {
            data = JSON.parse(data);
        } catch (parseErr) {
            console.error('JSON parse error:', parseErr);
            res.status(500).send('An error occurred while parsing the data. Please try again later.');
            return;
        }
        res.status(200).json(data);
    });

});

app.get('/getData', (req, res) => {
    const email = req.query.email;
    if (!email) {
        res.status(400).send('Email is required');
        return;
    }
    fs.readFile(getDataPath(), 'utf8', (err, data) => {
        if (err) {
            console.error('Read file error:', err);
            res.status(500).send('An error occurred while reading the file. Please try again later.');
            return;
        }
        try {
            data = JSON.parse(data);
        } catch (parseErr) {
            console.error('JSON parse error:', parseErr);
            res.status(500).send('An error occurred while parsing the data. Please try again later.');
            return;
        }
        const user = data.users.find(user => user.email === email);
        if (!user) {
            res.status(404).send('User not found');
        } else {
            res.status(200).json(user);
        }
    });
});

// POST METHODS:
app.post('/updateData', (req, res) => {
    const { email, pdfNumber } = req.body;
    if (!email || !pdfNumber) {
        res.status(400).send('Email and pdfNumber are required');
        return;
    }
    fs.readFile(getDataPath(), 'utf8', (err, data) => {
        if (err) {
            console.error('Read file error:', err);
            res.status(500).send('An error occurred while reading the file. Please try again later.');
            return;
        }
        try {
            data = JSON.parse(data);
        } catch (parseErr) {
            console.error('JSON parse error:', parseErr);
            res.status(500).send('An error occurred while parsing the data. Please try again later.');
            return;
        }

        const user = data.users.find(user => user.email === email);
        if (user) {
            if (!user.completedPDFs) {
                user.completedPDFs = [];
            }
            const index = user.completedPDFs.indexOf(pdfNumber);
            if (index === -1) {
                user.completedPDFs.push(pdfNumber);
            } else {
                user.completedPDFs.splice(index, 1);  // Correctly remove the item
            }
            user.completedCount = user.completedPDFs.length;
        } else {
            data.users.push({
                email,
                completedPDFs: [pdfNumber],
                completedCount: 1
            });
        }

        fs.writeFile(getDataPath(), JSON.stringify(data, null, 2), err => {
            if (err) {
                console.error('Write file error:', err);
                res.status(500).send('An error occurred while writing to the file. Please try again later.');
                return;
            }
            res.status(200).send(user);
        });
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}.`);
});
