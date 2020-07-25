import express from 'express';
import fs from 'fs';
import { promisify } from 'util';

const router = express.Router();
const writeFile = promisify(fs.writeFile);
const readFile = promisify(fs.readFile);

function RetornaDataHoraAtual(){
    var dNow = new Date();
    var localdate = dNow.getDate() + '/' + (dNow.getMonth()+1) + '/' + dNow.getFullYear() + ' ' + dNow.getHours() + ':' + dNow.getMinutes() + ':' + dNow.getSeconds();
    return localdate;
    }

// Criar intimacao por parametros URL
router.post('/CriarIntimacao', async (req, res) => {
  try {
    const dados = JSON.parse(await readFile(global.fileName, 'utf8'));

    let intimacao = {
        CDATO: dados.nextId++,
        DTPUBLICACAO: RetornaDataHoraAtual(),
        DTINICIOCARENCIA: '',
        DTTERMINOCARENCIA: '',
        DTINTIMACAO: '',
        NUDIASPRAZO: '30',
        DTTERMINODECURSO: '',
        CDPROCESSO: 'AAAAAAAA0',
        NUPROCESSO: '1111111-11-1234.8.19.1234',
        CDOBJETOATO: 'XXXXXXX' + dados.nextId,
        CDCONVENIO: 1,
        DECONVENIO: 'Ministério Público',
        FLPOSSUIERRO: 'N',
        DTERRO: '',
        DEMENSAGEMERRO: ''
    };
    
    dados.intimacoes.push(intimacao);

    await writeFile(global.fileName, JSON.stringify(dados));

    res.status(200).send("Intimação criada!");
    res.end();

    logger.info(`POST /CriarIntimacao - ${JSON.stringify(intimacao)}`);
  } catch (err) {
    res.status(400).send({ error: err.message });
  }
});

// Criar intimacao por JSON recebido
router.post('/CriarIntimacaoJson', async (req, res) => {
  try {
    let intimacao = req.body;
    const dados = JSON.parse(await readFile(global.fileName, 'utf8'));
    intimacao = {
      CDATO: dados.nextId++,
      DTPUBLICACAO: RetornaDataHoraAtual(),
      ...intimacao
    };
    dados.intimacoes.push(intimacao)
    await writeFile(global.fileName, JSON.stringify(dados));

    res.status(200).send("Intimacao criada!");
    res.end();

    logger.info(`POST /CriarIntimacaoJson - ${JSON.stringify(intimacao)}`);
  } catch (err) {
    res.status(400).send({ error: err.message });
  }
});

// Criar intimacao por parametros URL
router.post('/CriarIntimacao/:cdProcesso', async (req, res) => {
  try {
    const dados = JSON.parse(await readFile(global.fileName, 'utf8'));
    const cdProcesso = req.params.cdProcesso;

    let intimacao = {
        CDATO: dados.nextId++,
        DTPUBLICACAO: RetornaDataHoraAtual(),
        CDPROCESSO: cdProcesso,
        NUPROCESSO: '',
        CDOBJETOATO: cdObjeto,
        CDCONVENIO: cdConvenio
    };
    
    dados.intimacoes.push(intimacao);

    await writeFile(global.fileName, JSON.stringify(dados));

    res.status(200).send("Intimação criada!");
    res.end();

    logger.info(`POST /CriarIntimacao - ${JSON.stringify(intimacao)}`);
  } catch (err) {
    res.status(400).send({ error: err.message });
  }
});

router.get('/TodasIntimacoes', async (_, res) => {
  try {
    const dados = JSON.parse(await readFile(global.fileName, 'utf8'));
    delete dados.nextId;

    res.send(dados);

    logger.info("GET /TodasContas");
  } catch (err) {
    res.status(400).send({ error: err.message });
  }
});

router.get('/TodasIntimacoesComErro', async (_, res) => {
  try {
    const dados = JSON.parse(await readFile(global.fileName, 'utf8'));
    const intimacao = dados.intimacoes.filter(intimacao => intimacao.FLPOSSUIERRO === 'S');
    if (intimacao) {
      res.send(intimacao);
    } else {
      res.send(`Não foram encontradas intimações com erros.`);
      res.end();
    }

    res.send(dados);

    logger.info("GET /TodasIntimacoesComErro");
  } catch (err) {
    res.status(400).send({ error: err.message });
  }
});

router.get('/ConsultarIntimacaoProcesso/:nuProcesso', async (req, res) => {
  try {
    const dados = JSON.parse(await readFile(global.fileName, 'utf8'));
    const intimacao = dados.intimacoes.find(intimacao => intimacao.NUPROCESSO === req.params.nuProcesso);
    if (intimacao) {
      res.send(intimacao);
    } else {
      res.send(`Não foram encontradas intimações para o processo ${req.params.nuProcesso}`);
      res.end();
    }
    logger.info(`GET /ConsultarIntimacaoProcesso - " ${req.params.nuProcesso}`);
  } catch (err) {
    res.status(400).send({ error: err.message });
  }
});

router.get('/ConsultarIntimacaoEspecifica/:cdObjetoAto', async (req, res) => {
  try {
    const dados = JSON.parse(await readFile(global.fileName, 'utf8'));
    const intimacao = dados.intimacoes.find(intimacao => intimacao.CDOBJETOATO === req.params.cdObjetoAto);
    if (intimacao) {
      res.send(intimacao);
    } else {
      res.send(`Intimação não encontrada.`);
      res.end();
    }
    logger.info(`GET /ConsultarIntimacaoEspecifica - " ${req.params.cdObjetoAto}`);
  } catch (err) {
    res.status(400).send({ error: err.message });
  }
});

// router.delete('/ApagarConta/:id', async (req, res) => {
//   try {
//     const data = JSON.parse(await readFile(global.fileName, 'utf8'));
//     const intimacao = data.intimacoes.find(intimacao => intimacao.id === parseInt(req.params.id, 10));

//     if(!intimacao) {
//       res.send("Conta inexistente!");
//       res.end();
//     }

//     data.intimacoes = data.intimacoes.filter(intimacao => intimacao.id !== parseInt(req.params.id, 10));

//     await writeFile(global.fileName, JSON.stringify(data));    
//     res.send("Conta apagada!");
//     res.end();

//     logger.info(`DELETE /intimacao - " ${req.params.id}`);
//   } catch (err) {
//     res.status(400).send({ error: err.message });
//   }
// });

// router.put('/Depositar/:id/:deposito', async (req, res) => {
//   try {
//     const data = JSON.parse(await readFile(global.fileName, 'utf8'));
//     const intimacao = data.intimacoes.find(intimacao => intimacao.id === parseInt(req.params.id, 10));

//     if(!intimacao) {
//       res.send("Conta inexistente!");
//       app.close();
//     }
    
//     intimacao.balance = intimacao.balance + parseInt(req.params.deposito, 10);

//     await writeFile(global.fileName, JSON.stringify(data));
//     res.end();

//     logger.info(`PUT /Depositar - " ${JSON.stringify(intimacao)}`);
//   } catch (err) {
//     res.status(400).send({ error: err.message });
//   }
// });

// router.put('/Sacar/:id/:saque', async (req, res) => {
//   try {
//     const data = JSON.parse(await readFile(global.fileName, 'utf8'));
//     const intimacao = data.intimacoes.find(intimacao => intimacao.id === parseInt(req.params.id, 10));

//     if(!intimacao) {
//       res.send("Conta inexistente!");
//       app.close();
//     }
    
//     const saque = parseInt(req.params.saque, 10);
//     const saldo = intimacao.balance;

//     if (saldo < saque) {
//       res.send("Saldo insuficiente para saque!");
//       app.close();
//     }

//     intimacao.balance = saldo - saque;

//     await writeFile(global.fileName, JSON.stringify(data));
//     res.end();

//     logger.info(`PUT /Sacar - " ${JSON.stringify(intimacao)}`);
//   } catch (err) {
//     res.status(400).send({ error: err.message });
//   }
// });

export default router;
