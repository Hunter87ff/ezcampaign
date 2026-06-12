

export const config = {
    port : process.env.PORT || 8000,
    endpoint : process.env.ENDPOINT || 'http://localhost:8000',
    is_prod : process.env.NODE_ENV === 'production',
    debug_mode  : process.env.DEBUG_MODE === 'true',
    db_uri : process.env.DB_URI || '',
    jwt_secret : process.env.JWT_SECRET || '',
    jwt_expires : process.env.JWT_EXPIRES || '24h',
    bcrypt_salt_rounds : process.env.BCRYPT_SALT_ROUNDS || 10,
    session_secret : process.env.SESSION_SECRET || '',
    twilio : {
        sid : process.env.TWILIO_ACCOUNT_SID || '',
        auth_token : process.env.TWILIO_AUTH_TOKEN || '',
        from : process.env.TWILIO_FROM || ''
    },
    allowed : {
        origins : process.env.ALLOWED_HOSTS ? process.env.ALLOWED_HOSTS.trim().split(',') : ['http://localhost:3000']
    }
}

export default config;