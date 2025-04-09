import type { NextApiRequest, NextApiResponse } from 'next';
import { createCharge } from '@/lib/coinbase';
import { supabase } from '@/lib/supabase';
import { v4 as uuidv4 } from 'uuid';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { items, userId, userName, deliveryAddress, deliveryFee } = req.body;

    if (!items || !userId || !deliveryAddress) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Calculate total amount
    const subtotal = items.reduce(
      (total: number, item: any) => total + item.product.price * item.quantity,
      0
    );
    const total = subtotal + (deliveryFee || 5); // Default delivery fee is $5

    // Create order in database
    const orderId = uuidv4();
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        id: orderId,
        user_id: userId,
        shop_id: items[0].product.shop_id, // Assuming all items are from the same shop
        status: 'pending',
        total: total,
        delivery_address: deliveryAddress,
        delivery_fee: deliveryFee || 5,
      })
      .select()
      .single();

    if (orderError) {
      console.error('Error creating order:', orderError);
      return res.status(500).json({ error: 'Failed to create order' });
    }

    // Create order items
    const orderItems = items.map((item: any) => ({
      order_id: orderId,
      product_id: item.product.id,
      quantity: item.quantity,
      price: item.product.price,
    }));

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems);

    if (itemsError) {
      console.error('Error creating order items:', itemsError);
      return res.status(500).json({ error: 'Failed to create order items' });
    }

    // Create Coinbase Commerce charge
    const baseUrl = `${req.headers['x-forwarded-proto'] || 'http'}://${
      req.headers.host
    }`;
    
    const charge = await createCharge(
      order,
      userId,
      userName || 'Customer',
      total,
      baseUrl
    );

    return res.status(200).json({
      success: true,
      orderId: orderId,
      chargeId: charge.id,
      hostedUrl: charge.hosted_url,
    });
  } catch (error) {
    console.error('Error in create-charge API:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}