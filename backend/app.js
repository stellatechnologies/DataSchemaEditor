import express from 'express';
import fs from 'fs';
import path from 'path';
import cors from 'cors';
import multer from 'multer';

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));


const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './backend/uploads/'); 
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        const basename = path.basename(file.originalname, ext);
        const date = new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');
        const uniqueSuffix = `${year}${month}${day}_${hours}${minutes}${seconds}`;
        cb(null, `${basename}-${uniqueSuffix}${ext}`);
    }
});


const upload = multer({ storage: storage });

const PORT = process.env.PORT || 3000;
const schemaPath = path.join(path.resolve(), 'backend', 'schema.json');

// Endpoint to get the schema
app.get('/schema', async (req, res) => {
    try {
        const data = await fs.promises.readFile(schemaPath, { encoding: 'utf8' });
        res.json(JSON.parse(data));
    } catch (err) {
        res.status(500).send('Error reading schema file.');
    }
});

// Endpoint to update the schema
app.post('/schema', async (req, res) => {
    try {
        await fs.promises.writeFile(schemaPath, JSON.stringify(req.body, null, 2), { encoding: 'utf8' });
        res.send('Schema updated successfully.');
    } catch (err) {
        res.status(500).send('Error writing schema file.');
    }
});

// Endpoint to handle file uploads
app.post('/upload', upload.single('file'), async (req, res) => {
    try {
        const data = await fs.promises.readFile(req.file.path, { encoding: 'utf8' });
        res.json({ filename: req.file.filename, content: JSON.parse(data) });
    } catch (error) {
        res.status(500).send('Error uploading or reading file.');
    }
});


app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
