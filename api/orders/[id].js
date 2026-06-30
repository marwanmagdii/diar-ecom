import dbConnect from '../_utils/dbConnect.js';
import Order from '../_models/Order.js';
import mongoose from 'mongoose';
import { logger } from '../_utils/logger.js';

export default async function handler(req, res) {
  const { method, query: { id } } = req;

  await dbConnect();

  const isObjectId = mongoose.Types.ObjectId.isValid(id);
  const query = isObjectId ? { $or: [{ _id: id }, { id: id }] } : { id: id };

  switch (method) {
    case 'PUT':
      try {
        let updateData = req.body;
        if (req.body.clearTracking) {
          updateData = { $unset: { trackingData: "" } };
        }
        
        const order = await Order.findOneAndUpdate(query, updateData, {
          new: true,
          runValidators: true,
        });
        if (!order) {
          return res.status(404).json({ success: false, message: 'Order not found' });
        }
        const orderObj = order.toObject();
        orderObj.id = orderObj.id || orderObj._id.toString();
        res.status(200).json({ success: true, data: orderObj });
      } catch (error) {
        error.req = req;
        logger.error('API: Orders [id]', `PUT Request Failed at ${new Date().toISOString()}`, error);
        res.status(400).json({ success: false, error: error.message });
      }
      break;

    case 'DELETE':
      try {
        const deletedOrder = await Order.findOneAndDelete(query);
        if (!deletedOrder) {
          return res.status(404).json({ success: false, message: 'Order not found' });
        }
        res.status(200).json({ success: true, data: {} });
      } catch (error) {
        error.req = req;
        logger.error('API: Orders [id]', `DELETE Request Failed at ${new Date().toISOString()}`, error);
        res.status(400).json({ success: false, error: error.message });
      }
      break;

    default:
      res.status(405).json({ success: false, message: 'Method not allowed' });
      break;
  }
}
