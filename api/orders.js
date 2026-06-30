import dbConnect from './_utils/dbConnect.js';
import Order from './_models/Order.js';
import Counter from './_models/Counter.js';
import { logger } from './_utils/logger.js';

export default async function handler(req, res) {
  const { method } = req;

  await dbConnect();

  switch (method) {
    case 'GET':
      try {
        const orders = await Order.find({}).sort({ createdAt: -1 });
        const formattedOrders = orders.map(o => {
          const order = o.toObject();
          if (!order.id) {
            order.id = order._id.toString();
          }
          delete order._id;
          delete order.__v;
          return order;
        });
        res.status(200).json(formattedOrders);
      } catch (error) {
        error.req = req;
        logger.error('API: Orders', `GET Request Failed at ${new Date().toISOString()}`, error);
        res.status(400).json({ success: false, error: error.message });
      }
      break;
    case 'POST':
      try {
        const orderData = { ...req.body };
        
        // Auto-increment ID if not provided
        if (!orderData.id) {
          const counter = await Counter.findOneAndUpdate(
            { _id: 'orderId' },
            { $inc: { seq: 1 } },
            { new: true, upsert: true }
          );
          orderData.id = '#' + counter.seq.toString();
        }

        const order = await Order.create(orderData);
        const orderObj = order.toObject();
        orderObj.id = orderData.id;
        
        res.status(201).json({ success: true, data: orderObj });
      } catch (error) {
        error.req = req;
        logger.error('API: Orders', `POST Request Failed at ${new Date().toISOString()}`, error);
        res.status(400).json({ success: false, error: error.message });
      }
      break;
    default:
      res.status(405).json({ success: false, message: 'Method not allowed' });
      break;
  }
}
