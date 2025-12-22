import express, { Express, Request, Response } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3000;

// MODERN SECURITY DEFAULTS
app.use(helmet()); // Protects against common vulnerabilities
app.use(cors());   // Handles Cross-Origin requests
app.use(express.json());

app.get('/', (req: Request, res: Response) => {
  res.send('Secure Express Server Running 🚀');
});

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});