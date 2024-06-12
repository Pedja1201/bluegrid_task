import express from 'express';
import filesRouter from './api';

const app = express();
const port = 3000;

app.use('/api', filesRouter);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
