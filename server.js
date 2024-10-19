import express from 'express';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

// Serve static files from the React app (now in 'dist' directory)
app.use(express.static(path.join(__dirname, 'dist')));

// API endpoint to save the grocery list
app.post('/api/saveGroceryList', async (req, res) => {
  try {
    const groceryList = req.body;
    await fs.writeFile('groceryList.json', JSON.stringify(groceryList, null, 2));
    res.json({ message: 'Grocery list saved successfully' });
  } catch (error) {
    console.error('Error saving grocery list:', error);
    res.status(500).json({ error: 'Failed to save grocery list' });
  }
});

// The "catchall" handler: for any request that doesn't
// match one above, send back React's index.html file.
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Server listening on all network interfaces on port ${port}`);
});
