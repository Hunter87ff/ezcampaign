

export const config = {
    port: process.env.PORT || 8000,
    endpoint: process.env.ENDPOINT || 'http://localhost:8000',
    is_prod: process.env.NODE_ENV === 'production',
    debug_mode: process.env.DEBUG_MODE === 'true',
    db_uri: process.env.DB_URI || process.env.DB_URL || process.env.MONGODB_URI || '',
    jwt_secret: process.env.JWT_SECRET || '',
    jwt_expires: 1000 * 60 * 60 * 24 * 1,
    bcrypt_salt_rounds: process.env.BCRYPT_SALT_ROUNDS || 10,
    session_secret: process.env.SESSION_SECRET || '',
    twilio: {
        sid: process.env.TWILIO_ACCOUNT_SID || '',
        auth_token: process.env.TWILIO_AUTH_TOKEN || '',
        wp_number: process.env.TWILIO_WHATSAPP || '',
        ph_number: process.env.TWILIO_PHONE_NUMBER || '',
        hook_endpoint: process.env.TWILIO_HOOK_ENDPOINT || ''
    },
    allowed: {
        origins: process.env.ALLOWED_HOSTS ? process.env.ALLOWED_HOSTS.trim().split(',') : ['http://localhost:3000']
    }
}

function checkEnvironment() {
    function error(err: string) {
        console.error("Environment Error", err);
        process.exit(1);
    }
    if (!config.db_uri) return error('DB URI not found');
    if (!config.jwt_secret) return error('JWT SECRET not found');
    // if(!config.session_secret) return error('SESSION SECRET not found');
    if (!config.twilio.sid) return error('TWILIO SID not found');
    if (!config.twilio.auth_token) return error('TWILIO AUTH TOKEN not found');
    if (!config.twilio.wp_number) return error('TWILIO FROM not found');
    return true;
}

checkEnvironment();
export default config;