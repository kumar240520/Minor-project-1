const fs = require('fs');
const path = require('path');
const { supabase } = require('../supabaseClient');

const FALLBACK_FILE = path.join(__dirname, '..', 'data', 'system_settings.json');

// Default initial policy: allow_non_college_emails = true so 1st-year students can register immediately
let memorySettings = {
    auth_policy: {
        allow_non_college_emails: true,
        allowed_domains: ['.ies@ipsacademy.org'],
        updated_at: new Date().toISOString()
    }
};

// Load persisted JSON if available
try {
    if (fs.existsSync(FALLBACK_FILE)) {
        const raw = fs.readFileSync(FALLBACK_FILE, 'utf8');
        const parsed = JSON.parse(raw);
        if (parsed?.auth_policy) {
            memorySettings.auth_policy = {
                ...memorySettings.auth_policy,
                ...parsed.auth_policy
            };
        }
    }
} catch (e) {
    console.warn('Could not read fallback settings file:', e.message);
}

const saveLocalSettings = (settings) => {
    try {
        const dir = path.dirname(FALLBACK_FILE);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        fs.writeFileSync(FALLBACK_FILE, JSON.stringify(settings, null, 2), 'utf8');
    } catch (e) {
        console.warn('Could not write fallback settings file:', e.message);
    }
};

const getAuthPolicySetting = async () => {
    try {
        const { data, error } = await supabase
            .from('system_settings')
            .select('value')
            .eq('key', 'auth_policy')
            .maybeSingle();

        if (!error && data?.value) {
            memorySettings.auth_policy = {
                ...memorySettings.auth_policy,
                ...data.value
            };
            return memorySettings.auth_policy;
        }
    } catch (err) {
        // Fallback to local memory/file
    }
    return memorySettings.auth_policy;
};

const updateAuthPolicySetting = async (newPolicy) => {
    const updated = {
        ...memorySettings.auth_policy,
        ...newPolicy,
        updated_at: new Date().toISOString()
    };
    memorySettings.auth_policy = updated;
    saveLocalSettings(memorySettings);

    // Also attempt to upsert into Supabase system_settings if the table exists
    try {
        await supabase
            .from('system_settings')
            .upsert({
                key: 'auth_policy',
                value: updated,
                updated_at: new Date().toISOString()
            }, { onConflict: 'key' });
    } catch (err) {
        // If table doesn't exist, local cache is saved
    }

    return updated;
};

module.exports = {
    getAuthPolicySetting,
    updateAuthPolicySetting
};
