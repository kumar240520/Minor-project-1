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
    const { eventId, studentId, eventCoins } = JSON.parse(event.body);

    if (!eventId || !studentId) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'eventId and studentId are required' })
      };
    }

    const coinsToReward = eventCoins || 10;

    // Get event info
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('*')
      .eq('id', eventId)
      .single();

    if (eventError || !event) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ error: 'Event not found' })
      };
    }

    // Check if already attended
    const { data: existingAttendance } = await supabase
      .from('event_attendance')
      .select('*')
      .eq('event_id', eventId)
      .eq('student_id', studentId)
      .single();

    if (existingAttendance) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Student already attended this event' })
      };
    }

    // Record attendance
    const { error: attendanceError } = await supabase
      .from('event_attendance')
      .insert({
        event_id: eventId,
        student_id: studentId
      });

    if (attendanceError) throw attendanceError;

    // Reward the student
    const { data: student } = await supabase
      .from('users')
      .select('coins')
      .eq('id', studentId)
      .single();

    if (student) {
      await supabase
        .from('users')
        .update({ coins: student.coins + coinsToReward })
        .eq('id', studentId);

      // Add transaction record
      await supabase
        .from('transactions')
        .insert({
          user_id: studentId,
          reference_id: eventId,
          reference_type: 'EVENT_ATTENDANCE',
          transaction_type: 'EARN',
          amount: coinsToReward,
          description: `Attended event: ${event.title}`
        });
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        message: 'Event attendance recorded and reward granted successfully',
        reward: coinsToReward,
        eventName: event.title
      })
    };

  } catch (error) {
    console.error('Event attendance error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message || 'Something went wrong!' })
    };
  }
};
