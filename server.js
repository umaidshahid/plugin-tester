const express = require('express');
const bodyParser = require('body-parser');
const aChecker = require('accessibility-checker');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(express.static('public'));

app.post('/check-accessibility', async (req, res) => {
    const { html } = req.body;

    try {
        // Create a temporary HTML file with the provided HTML content
        const tempHtmlPath = path.join(__dirname, 'temp.html');
        fs.writeFileSync(tempHtmlPath, html);

        // Run the accessibility checker on the temporary HTML file
        const results = await aChecker.getCompliance(`file://${tempHtmlPath}`, 'testLabel');
        const report = results.report;
        const reportPath = path.join(__dirname, 'public', 'report.xlsx');

        fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

        res.download(reportPath, 'report.xlsx', (err) => {
            if (err) {
                console.error('Error downloading the file:', err);
                res.status(500).send('Error generating the report');
            }
        });

        // Clean up the temporary HTML file
        fs.unlinkSync(tempHtmlPath);
    } catch (error) {
        console.error('Error checking accessibility:', error);
        res.status(500).send('Error checking accessibility');
    } finally {
        await aChecker.close();
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
