import express from 'express';
import fs from 'fs';
import { promisify } from 'util';
import winston from 'winston';
import intimacoesRouter from './routes/intimacoes.js';
import cors from 'cors';

const app = express();
const port = process.env.PORT || 3000;
const exists = promisify(fs.exists);
const writeFile = promisify(fs.writeFile);
const { combine, timestamp, label, printf } = winston.format;
const myFormat = printf(({ level, message, label, timestamp }) => {
  return `${timestamp} [${label}] ${level}: ${message}`;
});
global.fileName = 'intimacoes.json';

app.use((req, res, next) => {
	  //Qual site tem permissão de realizar a conexão, no exemplo abaixo está o "*" indicando que qualquer site pode fazer a conexão
    res.header("Access-Control-Allow-Origin", "*");
	  //Quais são os métodos que a conexão pode realizar na API
    res.header("Access-Control-Allow-Methods", 'GET,PUT,POST,DELETE');
    app.use(cors());
    next();
});

app.use(express.json());
app.use('/intimacoes', intimacoesRouter);

global.logger = winston.createLogger({
  level: 'silly',
  transports: [
    new (winston.transports.Console)(),
    new (winston.transports.File)({ filename: 'api-intimacoes.log' })
  ],
  format: combine(
    label({ label: 'api-intimacoes' }),
    timestamp(),
    myFormat
  )
});

app.listen(port, async () => {
  try {
    const fileExists = await exists(global.fileName);
    if (!fileExists) {
      const initialJson = {
        nextId: 1,
        intimacoes: []
      };
      await writeFile(global.fileName, JSON.stringify(initialJson));
    }
  } catch (err) {
    logger.error(err);
  }
  logger.info(`API Iniciada!!! Porta: ${port}`);
});