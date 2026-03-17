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
    const resourceId = event.pathParameters.resourceId;
    const { userId } = JSON.parse(event.body);

    if (!userId || !resourceId) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'userId and resourceId are required' })
      };
    }

    // Get resource info
    const { data: resource, error: resourceError } = await supabase
      .from('resources')
      .select('*')
      .eq('id', resourceId)
      .single();

    if (resourceError || !resource) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ error: 'Resource not found' })
      };
    }

    // Get user info
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('coins')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ error: 'User not found' })
      };
    }

    // Check if user has enough coins
    if (user.coins < resource.price) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Insufficient coins' })
      };
    }

    // Check if already purchased
    const { data: existingPurchase } = await supabase
      .from('resource_purchases')
      .select('*')
      .eq('user_id', userId)
      .eq('resource_id', resourceId)
      .single();

    if (existingPurchase) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ 
          message: 'Resource already purchased',
          file_url: resource.file_url
        })
      };
    }

    // Process purchase
    const { error: purchaseError } = await supabase
      .from('users')
      .update({ coins: user.coins - resource.price })
      .eq('id', userId);

    if (purchaseError) throw purchaseError;

    // Record purchase
    await supabase
      .from('resource_purchases')
      .insert({
        user_id: userId,
        resource_id: resourceId
      });

    // Add transaction record
    await supabase
      .from('transactions')
      .insert({
        user_id: userId,
        reference_id: resourceId,
        reference_type: 'RESOURCE_PURCHASE',
        transaction_type: 'SPEND',
        amount: resource.price,
        description: `Purchased resource: ${resource.title}`
      });

    // Reward the uploader
    await supabase
      .from('users')
      .update({ coins: `coins + ${Math.floor(resource.price * 0.8)}` })
      .eq('id', resource.uploader_id);

    await supabase
      .from('transactions')
      .insert({
        user_id: resource.uploader_id,
        reference_id: resourceId,
        reference_type: 'RESOURCE_SALE',
        transaction_type: 'EARN',
        amount: Math.floor(resource.price * 0.8),
        description: `Sale of resource: ${resource.title}`
      });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        message: 'Resource purchased successfully',
        file_url: resource.file_url,
        remainingCoins: user.coins - resource.price
      })
    };

  } catch (error) {
    console.error('Resource purchase error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message || 'Something went wrong!' })
    };
  }
};
