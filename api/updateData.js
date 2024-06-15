// api/updateData.js
const fs = require('fs');
const path = require('path');

export default (req, res) => {
  if (req.method === 'POST') {
    const dataPath = path.join(__dirname, '..', 'data', 'data.json');
    const { email, pdfNumber } = req.body;

    if (!email || !pdfNumber) {
      res.status(400).json({ error: 'Email and PDF number are required' });
      return;
    }

    fs.readFile(dataPath, 'utf8', (err, data) => {
      if (err) {
        res.status(500).json({ error: 'Failed to read data' });
        return;
      }

      let jsonData = JSON.parse(data);
      let user = jsonData.users.find(u => u.email === email);

      if (user) {
        if (!user.completedPDFs.includes(pdfNumber)) {
          user.completedPDFs.push(pdfNumber);
          user.completedCount = user.completedPDFs.length;
        }
      } else {
        jsonData.users.push({
          email,
          completedCount: 1,
          completedPDFs: [pdfNumber]
        });
      }

      fs.writeFile(dataPath, JSON.stringify(jsonData, null, 2), (err) => {
        if (err) {
          res.status(500).json({ error: 'Failed to update data' });
          return;
        }
        res.status(200).json({ message: 'Data updated successfully' });
      });
    });
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
};
