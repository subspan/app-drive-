import type { NextApiRequest, NextApiResponse } from 'next';
import { verifyWebhookSignature } from '@/lib/coinbase';
import { supabase } from '@/lib/supabase';
import getRawBody from 'raw-body';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get the raw request body
    const rawBody = await getRawBody(req);
    const stringBody = rawBody.toString();
    const body = JSON.parse(stringBody);

    // Verify the webhook signature
    const signature = req.headers['x-cc-webhook-signature'] as string;
    const webhookSecret = process.env.COINBASE_COMMERCE_WEBHOOK_SECRET as string;

    if (!signature || !webhookSecret) {
      console.error('Missing signature or webhook secret');
      return res.status(400).json({ error: 'Invalid webhook' });
    }

    const isValid = verifyWebhookSignature(stringBody, signature, webhookSecret);
    if (!isValid) {
      console.error('Invalid webhook signature');
      return res.status(400).json({ error: 'Invalid webhook signature' });
    }

    // Process the webhook event
    const event = body;
    const { type } = event;
    const { metadata, payments } = event.data;

    if (!metadata || !metadata.order_id) {
      console.error('Missing order_id in metadata');
      return res.status(400).json({ error: 'Missing order ID' });
    }

    const orderId = metadata.order_id;

    // Update order status based on event type
    if (type === 'charge:confirmed') {
      // Payment confirmed
      const { error } = await supabase
        .from('orders')
        .update({ status: 'accepted' })
        .eq('id', orderId);

      if (error) {
        console.error('Error updating order status:', error);
        return res.status(500).json({ error: 'Failed to update order status' });
      }
    } else if (type === 'charge:failed') {
      // Payment failed
      const { error } = await supabase
        .from('orders')
        .update({ status: 'cancelled' })
        .eq('id', orderId);

      if (error) {
        console.error('Error updating order status:', error);
        return res.status(500).json({ error: 'Failed to update order status' });
      }
    }

    return res.status(200).json({ received: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}