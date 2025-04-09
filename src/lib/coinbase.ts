import { Client, resources } from 'coinbase-commerce-node';
import { Order } from './supabase';

// Initialize the Coinbase Commerce client
const coinbaseClient = new Client({
  apiKey: process.env.COINBASE_COMMERCE_API_KEY,
});

const { Charge } = resources;

export type ChargeData = {
  name: string;
  description: string;
  local_price: {
    amount: string;
    currency: string;
  };
  pricing_type: string;
  metadata: {
    customer_id: string;
    customer_name: string;
    order_id: string;
  };
  redirect_url: string;
  cancel_url: string;
};

/**
 * Create a new charge in Coinbase Commerce
 */
export const createCharge = async (
  order: Order,
  userId: string,
  userName: string,
  amount: number,
  baseUrl: string
): Promise<any> => {
  try {
    const chargeData: ChargeData = {
      name: `VapeRush Order #${order.id}`,
      description: `Payment for your order from VapeRush`,
      local_price: {
        amount: amount.toFixed(2),
        currency: 'USD',
      },
      pricing_type: 'fixed_price',
      metadata: {
        customer_id: userId,
        customer_name: userName,
        order_id: order.id,
      },
      redirect_url: `${baseUrl}/orders/${order.id}/confirmation`,
      cancel_url: `${baseUrl}/checkout?canceled=true`,
    };

    const charge = await Charge.create(chargeData);
    return charge;
  } catch (error) {
    console.error('Error creating Coinbase Commerce charge:', error);
    throw error;
  }
};

/**
 * Verify a webhook signature from Coinbase Commerce
 */
export const verifyWebhookSignature = (
  rawBody: string,
  signature: string,
  webhookSecret: string
): boolean => {
  try {
    const event = Charge.verifyWebhook(rawBody, signature, webhookSecret);
    return !!event;
  } catch (error) {
    console.error('Error verifying webhook signature:', error);
    return false;
  }
};