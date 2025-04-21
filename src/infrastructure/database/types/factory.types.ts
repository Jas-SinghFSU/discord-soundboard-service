import { UserRepository } from 'src/domain/ports/repositories';
import { AudioRepository } from 'src/domain/ports/repositories/audio-repository.interface';

export enum RepositoryType {
    USER = 'user',
    AUDIO = 'audio',
}

export type RepositoryMap = {
    [RepositoryType.USER]: UserRepository;
    [RepositoryType.AUDIO]: AudioRepository;
};

export type RepositoryCache = {
    [K in RepositoryType]: RepositoryMap[K] | undefined;
};

export interface RepositoryFactory {
    getUserRepository(): UserRepository;
    getAudioRepository(): AudioRepository;
}

export type ProviderMap = {
    [Database in DatabaseProviders]: RepositoryFactory;
};

export enum DatabaseProviders {
    POSTGRES = 'postgres',
}
