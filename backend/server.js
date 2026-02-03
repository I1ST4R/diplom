const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get('/api/hello', (req, res) => {
  res.json({ message: 'Привет с backend 👋' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Backend server listening on http://localhost:${PORT}`);
});

