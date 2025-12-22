#!/usr/bin/env node

import inquirer from 'inquirer';
import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';
import ora from 'ora';
import { execa } from 'execa';

// ==========================================
// 🧩 SECTION 1: TEMPLATE GENERATORS
// ==========================================

/**
 * Generates the Database Connection Code (Mongoose or Postgres)
 */
const generateDbCode = (dbType, isTs) => {
  const isMongo = dbType === 'MongoDB';
  
  if (isTs) {
    if (isMongo) {
      return `import mongoose from 'mongoose';

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/myapp');
    console.log(\`MongoDB Connected: \${conn.connection.host}\`);
  } catch (error) {
    console.error('Error connecting to MongoDB', error);
    process.exit(1);
  }
};`;
    } else {
      // PostgreSQL
      return `import { Pool } from 'pg';

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export const query = (text: string, params?: any[]) => pool.query(text, params);`;
    }
  } else {
    // JavaScript Version
    if (isMongo) {
      return `const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/myapp');
    console.log(\`MongoDB Connected: \${conn.connection.host}\`);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};
module.exports = connectDB;`;
    } else {
      return `const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
module.exports = {
  query: (text, params) => pool.query(text, params),
};`;
    }
  }
};

/**
 * Generates the Authentication Controller (Login/Register)
 */
const generateAuthCode = (isTs) => {
  const tsCode = `import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

// ⚠️ Replace this with real DB calls
const MOCK_DB: any[] = []; 

export const register = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    MOCK_DB.push({ email, password: hashedPassword });
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const user = MOCK_DB.find(u => u.email === email);
    
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ email }, process.env.JWT_SECRET || 'secret', { expiresIn: '1h' });
    res.json({ token });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};`;

  const jsCode = `const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const MOCK_DB = []; // ⚠️ Replace with real DB

exports.register = async (req, res) => {
  try {
    const { email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    MOCK_DB.push({ email, password: hashedPassword });
    res.status(201).json({ message: 'User registered' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = MOCK_DB.find(u => u.email === email);
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const token = jwt.sign({ email }, process.env.JWT_SECRET || 'secret', { expiresIn: '1h' });
    res.json({ token });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};`;

  return isTs ? tsCode : jsCode;
};

// ==========================================
// 🚀 SECTION 2: MAIN CLI LOGIC
// ==========================================

async function init() {
  console.log(chalk.bold.hex('#00d4ff')('\n🐱 MEOW CLI ') + chalk.white(' - The Ultimate Express Generator \n'));

  // 1. Interactive Questions
  const answers = await inquirer.prompt([
    { type: 'input', name: 'name', message: 'Project Name:', default: 'my-express-app' },
    { type: 'list', name: 'language', message: 'Language:', choices: ['TypeScript', 'JavaScript'] },
    { type: 'list', name: 'db', message: 'Database:', choices: ['MongoDB', 'PostgreSQL', 'None'] },
    { type: 'confirm', name: 'auth', message: 'Add Authentication (JWT + Bcrypt)?', default: true },
    { type: 'confirm', name: 'docker', message: 'Generate Dockerfile?', default: false },
    { type: 'list', name: 'manager', message: 'Package Manager:', choices: ['npm', 'bun', 'pnpm', 'yarn'] },
  ]);

  const projectPath = path.join(process.cwd(), answers.name);
  const isTs = answers.language === 'TypeScript';
  const srcDir = path.join(projectPath, 'src');

  if (fs.existsSync(projectPath)) {
    console.log(chalk.red(`\n❌ Error: Folder "${answers.name}" already exists.`));
    process.exit(1);
  }

  const spinner = ora('Architecting your application...').start();

  try {
    // 2. Create Folders
    await fs.mkdirp(srcDir);
    if (answers.auth) {
      await fs.mkdirp(path.join(srcDir, 'controllers'));
      await fs.mkdirp(path.join(srcDir, 'routes'));
    }
    if (answers.db !== 'None') {
      await fs.mkdirp(path.join(srcDir, 'config'));
    }

    // 3. Build Dependency Lists
    const deps = ['express', 'dotenv', 'cors', 'helmet'];
    const devDeps = ['nodemon'];

    // Feature Dependencies
    if (answers.auth) deps.push('jsonwebtoken', 'bcryptjs');
    if (answers.db === 'MongoDB') deps.push('mongoose');
    if (answers.db === 'PostgreSQL') deps.push('pg');

    // SMART TYPESCRIPT LOGIC
    if (isTs) {
      devDeps.push('typescript', 'ts-node', '@types/node');
      
      const typeMap = {
        'express': '@types/express',
        'cors': '@types/cors',
        'jsonwebtoken': '@types/jsonwebtoken',
        'bcryptjs': '@types/bcryptjs',
        'pg': '@types/pg',
      };

      deps.forEach(dep => {
        if (typeMap[dep]) devDeps.push(typeMap[dep]);
      });
    }

    // 4. Generate package.json
    const pkgJson = {
      name: answers.name,
      version: '1.0.0',
      main: isTs ? 'dist/index.js' : 'src/index.js',
      scripts: {
        dev: isTs ? 'nodemon src/index.ts' : 'nodemon src/index.js',
        build: isTs ? 'tsc' : 'echo "No build step"',
        start: 'node dist/index.js'
      },
      dependencies: {}, 
      devDependencies: {} 
    };

    // 5. Build File Contents
    const filesToWrite = [];

    // > Entry Point (index.ts/js)
    let entryCode = isTs 
      ? `import express from 'express';\nimport dotenv from 'dotenv';\nimport cors from 'cors';\nimport helmet from 'helmet';\n`
      : `const express = require('express');\nconst dotenv = require('dotenv');\nconst cors = require('cors');\nconst helmet = require('helmet');\n`;

    if (answers.db !== 'None') {
      entryCode += isTs 
        ? `import { connectDB } from './config/db';\n` 
        : `const connectDB = require('./config/db');\n`;
    }
    
    entryCode += `\ndotenv.config();\nconst app = express();\n\n// Middleware\napp.use(express.json());\napp.use(cors());\napp.use(helmet());\n`;
    
    if (answers.db !== 'None') entryCode += `\n// Database\nconnectDB();\n`;
    if (answers.auth) entryCode += `\n// Routes\napp.use('/api/auth', require('./routes/auth').default || require('./routes/auth'));\n`;
    
    entryCode += `\nconst PORT = process.env.PORT || 5000;\napp.listen(PORT, () => console.log(\`Server running on port \${PORT}\`));`;

    filesToWrite.push({ path: path.join(srcDir, isTs ? 'index.ts' : 'index.js'), content: entryCode });

    // > Database Config
    if (answers.db !== 'None') {
      filesToWrite.push({ 
        path: path.join(srcDir, `config/db.${isTs ? 'ts' : 'js'}`), 
        content: generateDbCode(answers.db, isTs) 
      });
    }

    // > Auth Logic (Controllers & Routes)
    if (answers.auth) {
      filesToWrite.push({ 
        path: path.join(srcDir, `controllers/authController.${isTs ? 'ts' : 'js'}`), 
        content: generateAuthCode(isTs) 
      });

      const routeCode = isTs 
        ? `import { Router } from 'express';\nimport { login, register } from '../controllers/authController';\nconst router = Router();\nrouter.post('/register', register);\nrouter.post('/login', login);\nexport default router;`
        : `const express = require('express');\nconst { login, register } = require('../controllers/authController');\nconst router = express.Router();\nrouter.post('/register', register);\nrouter.post('/login', login);\nmodule.exports = router;`;

      filesToWrite.push({ 
        path: path.join(srcDir, `routes/auth.${isTs ? 'ts' : 'js'}`), 
        content: routeCode 
      });
    }

    // > TSConfig
    if (isTs) {
      filesToWrite.push({
        path: path.join(projectPath, 'tsconfig.json'),
        content: JSON.stringify({ compilerOptions: { target: "es2020", module: "commonjs", outDir: "./dist", rootDir: "./src", strict: true, esModuleInterop: true } }, null, 2)
      });
    }

    // > Dockerfile
    if (answers.docker) {
      const dockerCode = `FROM node:18-alpine\nWORKDIR /app\nCOPY package*.json ./\nRUN npm install\nCOPY . .\n${isTs ? 'RUN npm run build' : ''}\nEXPOSE 5000\nCMD ["npm", "start"]`;
      filesToWrite.push({ path: path.join(projectPath, 'Dockerfile'), content: dockerCode });
      filesToWrite.push({ path: path.join(projectPath, '.dockerignore'), content: `node_modules\ndist\n.env` });
    }

    // > .env file
    const envContent = `PORT=5000\nMONGO_URI=mongodb://localhost:27017/${answers.name}\nDATABASE_URL=postgres://user:pass@localhost:5432/${answers.name}\nJWT_SECRET=supersecretkey`;
    filesToWrite.push({ path: path.join(projectPath, '.env'), content: envContent });

    // > package.json
    filesToWrite.push({ path: path.join(projectPath, 'package.json'), content: JSON.stringify(pkgJson, null, 2) });

    // 6. Write All Files (Parallel I/O)
    await Promise.all(filesToWrite.map(f => fs.writeFile(f.path, f.content)));

    // 7. Install Dependencies
    spinner.text = `Installing dependencies via ${answers.manager}...`;
    
    if (deps.length) await execa(answers.manager, ['install', ...deps], { cwd: projectPath });
    if (devDeps.length) await execa(answers.manager, ['install', '-D', ...devDeps], { cwd: projectPath });

    spinner.succeed(chalk.green('🚀 Project Successfully Generated!'));
    console.log(chalk.dim('-----------------------------------------'));
    console.log(`\nNext steps:\n  cd ${answers.name}\n  ${answers.manager} run dev`);

  } catch (err) {
    spinner.fail('Error generating project');
    console.error(err);
  }
}

init();