export const POSTGRES_MAIN_POOL = Symbol('POSTGRES_MAIN_POOL');

export const RepositoryTokens = {
    USER: Symbol('UserRepository'),
    AUDIO: Symbol('AudioRepository'),
} as const;

export const PostgresMapperTokens = {
    USER: Symbol('PostgresUserMapper'),
    AUDIO_COMMAND: Symbol('PostgresAudioCommandMapper'),
} as const;

export const TRANSACTION_MANAGER = Symbol('TransactionManager');
