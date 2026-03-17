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
    const { userId } = JSON.parse(event.body);

    if (!userId) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'userId is required' })
      };
    }

    // Check if user already claimed daily reward today
    const { data: existingClaim } = await supabase
      .from('users')
      .select('last_login_reward, coins')
      .eq('id', userId)
      .single();

    if (!existingClaim) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ error: 'User not found' })
      };
    }

    const today = new Date().toISOString().split('T')[0];
    const lastClaim = existingClaim.last_login_reward?.split('T')[0];

    if (lastClaim === today) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ message: 'Daily reward already claimed today.' })
      };
    }

    // Grant reward
    const { data, error } = await supabase
      .from('users')
      .update({ 
        coins: existingClaim.coins + 2, 
        last_login_reward: new Date().toISOString() 
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;

    // Add transaction record
    await supabase
      .from('transactions')
      .insert({
        user_id: userId,
        reference_type: 'DAILY_LOGIN',
        transaction_type: 'EARN',
        amount: 2,
        description: 'Daily login bonus'
      });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ 
        message: 'Successfully claimed 2 Edu Coins for logging in today!',
        user: data
      })
    };

  } catch (error) {
    console.error('Daily login reward error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message || 'Something went wrong!' })
    };
  }
};
