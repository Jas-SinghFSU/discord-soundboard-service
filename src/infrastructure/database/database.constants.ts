export const POSTGRES_MAIN_POOL = Symbol('POSTGRES_MAIN_POOL');

export const RepositoryTokens = {
    USER: Symbol('device_repository'),
} as const;

export const PostgresMapperTokens = {
    USER: Symbol('postgres_user_mapper'),
    AUDIO_COMMAND: Symbol('postgres_audio_cmd_mapper'),
} as const;
