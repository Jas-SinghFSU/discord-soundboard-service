import { UserRepository } from 'src/domain/ports/repositories/user-repository.interface';

export enum Repository {
    USER = 'user',
}

export type InstanceMap = {
    [Repository.USER]: UserRepository;
};

export interface RepositoryFactory {
    getRepo<R extends Repository>(repo: R): InstanceMap[R];
}

export type ProviderMap = {
    [Database in DatabaseHosts]: RepositoryFactory;
};

export enum DatabaseHosts {
    POSTGRES = 'postgres',
}
