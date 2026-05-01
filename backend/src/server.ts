import express from 'express';
import cors from 'cors';
import propertyRoutes from './routes/propertyRoutes.js';

const app = express();
const PORT: number = Number(process.env.PORT ?? 4000);

//necessary for react dev server to call us
app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.use('/api/properties', propertyRoutes);

app.listen(PORT, () => {
  console.log(`Millow backend listening on http://localhost:${PORT}`);
});