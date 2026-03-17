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
    const { doubtId, answerId, authorId } = JSON.parse(event.body);

    if (!doubtId || !answerId || !authorId) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'doubtId, answerId, and authorId are required' })
      };
    }

    // Get answer info
    const { data: answer, error: answerError } = await supabase
      .from('answers')
      .select('*')
      .eq('id', answerId)
      .eq('doubt_id', doubtId)
      .single();

    if (answerError || !answer) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ error: 'Answer not found' })
      };
    }

    // Check if answer is already accepted
    if (answer.is_accepted) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Answer already accepted' })
      };
    }

    // Mark answer as accepted
    const { error: updateError } = await supabase
      .from('answers')
      .update({ is_accepted: true })
      .eq('id', answerId);

    if (updateError) throw updateError;

    // Mark doubt as resolved
    await supabase
      .from('doubts')
      .update({ is_resolved: true })
      .eq('id', doubtId);

    // Reward the answer author (5 coins)
    const { data: answerAuthor } = await supabase
      .from('users')
      .select('coins')
      .eq('id', authorId)
      .single();

    if (answerAuthor) {
      await supabase
        .from('users')
        .update({ coins: answerAuthor.coins + 5 })
        .eq('id', authorId);

      // Add transaction record
      await supabase
        .from('transactions')
        .insert({
          user_id: authorId,
          reference_id: answerId,
          reference_type: 'ANSWER_ACCEPTED',
          transaction_type: 'EARN',
          amount: 5,
          description: 'Answer accepted in doubt solving'
        });
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        message: 'Answer accepted and reward granted successfully',
        reward: 5
      })
    };

  } catch (error) {
    console.error('Accept answer error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message || 'Something went wrong!' })
    };
  }
};
