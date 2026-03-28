require('dotenv').config({ 
    path: require('path').resolve(__dirname, '../.env'),
    silent: true 
});

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('URL:', supabaseUrl);
console.log('Key:', supabaseKey ? 'PRESENT' : 'MISSING');

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
    try {
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .limit(1);
        
        if (error) {
            console.log('Error querying users Table:', error.message);
        } else {
            console.log('Successfully queried users Table!');
        }

        console.log('Testing upsert on otp_codes...');
        const testEmail = 'test@example.com';
        const testOtp = '123456';
        const { data: upsertData, error: upsertError } = await supabase
            .from('otp_codes')
            .upsert({
                email: testEmail,
                code: testOtp,
                expires_at: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
                created_at: new Date().toISOString()
            }, {
                onConflict: 'email'
            });

        if (upsertError) {
            console.log('Upsert Error:', upsertError.message);
            console.log('Error Details:', upsertError);
        } else {
            console.log('Upsert successful!');
        }
    } catch (err) {
        console.log('Unexpected Error:', err.message);
    }
}

testConnection();
