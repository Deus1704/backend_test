const fs = require('fs');
const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');

const app = express();

app.use(bodyParser.json());

const PORT = process.env.PORT || 3000;
const dataPath = path.join(__dirname, 'data', 'data.json');
/// GET METHODS:
app.get('/getData', (req, res) => {
    const email = req.query.email; //This gets the user email. Remember to actually send this in the request.
    if (!email){
        res.status(400).send('Email is required');
        return;
    }
    fs.readFile(dataPath, 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            res.status(500).send('An error occurred. Please try again later.');
            return;
        }
        //Parse the data to get an array of objects
        data = JSON.parse(data);
        //This is where I would filter the data based on the user email
        const user = data.users.find(user => user.email === email);
        if (!user){
            res.status(404).send('User not found');
            return;
        }else {
            res.status(200).json(user);
        }
    });
});

//POST METHODS;
app.post('/updateData', (req, res) => {
    const { email, pdfNumber } = req.body;
    if (!email || !pdfNumber) {
        res.status(400).send('Email and pdfNumber are required');
        return;
    }
    fs.readFile(dataPath, 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            res.status(500).send('An error occurred. Please try again later.');
            return;
        }
        // Parse the data to get an array of objects
        data = JSON.parse(data);

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
        fs.writeFile(dataPath, JSON.stringify(data, null, 2), err => {
            if (err) {
                console.error(err);
                res.status(500).send('An error occurred. Please try again later.');
                return;
            }
            res.status(200).send('Data has been updated');
        });
    });
});


app.listen(PORT, () => {    
    console.log(`Server is running on port ${PORT}.`);
  });