import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const app = express();
app.use(cors());
app.use(bodyParser.json({ limit: '200mb' }));
app.use(bodyParser.urlencoded({ limit: '200mb', extended: true }));

// dynamic imports
import productsHandler from './api/products.js';
import productsIdHandler from './api/products/[id].js';
import ordersHandler from './api/orders.js';
import ordersIdHandler from './api/orders/[id].js';
import configHandler from './api/config.js';
import logsHandler from './api/logs.js';

const createVercelReq = (req) => {
  return {
    ...req,
    query: { ...req.query, ...req.params },
    body: req.body,
    method: req.method,
  };
};

const wrapHandler = (handler) => {
  return async (req, res) => {
    const vercelReq = createVercelReq(req);
    try {
      await handler(vercelReq, res);
    } catch (err) {
      console.error(err);
      if (!res.headersSent) {
        res.status(500).json({ error: 'Internal Server Error' });
      }
    }
  };
};

app.all('/api/products', wrapHandler(productsHandler));
app.all('/api/products/:id', wrapHandler(productsIdHandler));
app.all('/api/orders', wrapHandler(ordersHandler));
app.all('/api/orders/:id', wrapHandler(ordersIdHandler));
app.all('/api/config', wrapHandler(configHandler));
app.all('/api/logs', wrapHandler(logsHandler));

const PORT = process.env.PORT || 3005;
app.listen(PORT, () => {
  console.log(`Local Express API server listening on port ${PORT}`);
});
