import { AuthStrategy } from 'src/presentation/auth/auth.types';

export default (): Record<string, unknown> => ({
    port: parseInt(process.env.PORT ?? '3000', 10),
    productionUrl: process.env.PRODUCTION_URL,
    authStrategy: process.env.AUTH_STRATEGY ?? AuthStrategy.DISCORD,
    uiUrl: process.env.UI_URL ?? 'http://localhost:3333',

    discord: {
        clientID: process.env.DISCORD_CLIENT_ID,
        clientSecret: process.env.DISCORD_CLIENT_SECRET,
        callbackURL: process.env.DISCORD_CALLBACK_URL,
        botToken: process.env.DISCORD_BOT_TOKEN,
        serverId: process.env.SERVER_ID,
        allowedRoles: process.env.ALLOWED_ROLES,
    },

    session: {
        secret: process.env.SESSION_SECRET,
    },

    database: {
        type: process.env.DATABASE ?? 'postgres',
        host: process.env.PG_HOST ?? 'localhost',
        port: parseInt(process.env.PG_PORT ?? '5432', 10),
        user: process.env.PG_USER,
        password: process.env.PG_PASSWORD,
        name: process.env.PG_DATABASE,
    },
});
