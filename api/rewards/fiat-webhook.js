const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

exports.handler = async (event, context) => {
  // Set CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Handle preflight OPTIONS request
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    // Parse webhook payload (this would be specific to your payment provider)
    const webhookData = JSON.parse(event.body);
    
    // Verify webhook signature (implement based on payment provider)
    // const signature = event.headers['x-webhook-signature'];
    // if (!verifyWebhookSignature(signature, event.body)) {
    //   return {
    //     statusCode: 401,
    //     headers,
    //     body: JSON.stringify({ error: 'Invalid webhook signature' })
    //   };
    // }

    const { userId, amountPaid, paymentId, coinsCredited, status } = webhookData;

    if (!userId || !amountPaid || !paymentId || !coinsCredited) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Missing required fields' })
      };
    }

    if (status !== 'success') {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ message: 'Payment not successful, ignoring' })
      };
    }

    // Check if payment already processed
    const { data: existingPayment } = await supabase
      .from('fiat_purchases')
      .select('*')
      .eq('payment_id', paymentId)
      .single();

    if (existingPayment) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ message: 'Payment already processed' })
      };
    }

    // Record payment
    const { error: paymentError } = await supabase
      .from('fiat_purchases')
      .insert({
        user_id: userId,
        payment_id: paymentId,
        amount_paid: amountPaid,
        coins_credited: coinsCredited,
        status: 'success'
      });

    if (paymentError) throw paymentError;

    // Credit coins to user
    const { data: user } = await supabase
      .from('users')
      .select('coins')
      .eq('id', userId)
      .single();

    if (user) {
      await supabase
        .from('users')
        .update({ coins: user.coins + coinsCredited })
        .eq('id', userId);

      // Add transaction record
      await supabase
        .from('transactions')
        .insert({
          user_id: userId,
          reference_id: paymentId,
          reference_type: 'FIAT_PURCHASE',
          transaction_type: 'EARN',
          amount: coinsCredited,
          description: `Purchased ${coinsCredited} coins for $${amountPaid}`
        });
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        message: 'Payment processed successfully',
        coinsCredited,
        newBalance: user ? user.coins + coinsCredited : null
      })
    };

  } catch (error) {
    console.error('Fiat webhook error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message || 'Something went wrong!' })
    };
  }
};
