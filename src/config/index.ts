export default (): Record<string, unknown> => ({
    port: parseInt(process.env.PORT ?? '3000', 10),
    discord: {
        clientID: process.env.DISCORD_CLIENT_ID,
        clientSecret: process.env.DISCORD_CLIENT_SECRET,
        callbackURL: process.env.DISCORD_CALLBACK_URL,
        scope: ['identify'],
    },
    session: {
        secret: process.env.SESSION_SECRET,
    },
});
