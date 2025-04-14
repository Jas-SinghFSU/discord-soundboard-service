import { UserAttributes } from 'src/domain/entities/user/user.types';
import { User } from 'src/domain/entities/user/user.entity';
import { Mapper } from '../../types/mapper.interface';
import { PostgresUser } from '../models';
import { getValidatedDatabaseRecord } from '../database-model.validator';

export class PostgresUserMapper implements Mapper<User, PostgresUser> {
    public async toEntity(document: Record<string, unknown>): Promise<User> {
        const validatedDocument = await getValidatedDatabaseRecord(PostgresUser, document);

        return User.fromData(this._toUserAttributes(validatedDocument));
    }

    public toRecord(userEntity: User): PostgresUser {
        const userRecord: PostgresUser = {
            id: userEntity.id,
            username: userEntity.username,
            displayName: userEntity.displayName,
            avatar: userEntity.avatar,
            provider: userEntity.provider,
            entryAudio: userEntity.audioPreferences.entryAudio,
            volume: userEntity.audioPreferences.volume,
            playOnEntry: userEntity.audioPreferences.playOnEntry,
            favorites: userEntity.audioPreferences.favorites,
        };

        return userRecord;
    }

    private _toUserAttributes(userRecord: PostgresUser): UserAttributes {
        const userAttributes: UserAttributes = {
            id: userRecord.id,
            username: userRecord.username,
            displayName: userRecord.displayName,
            avatar: userRecord.avatar,
            provider: userRecord.provider,
            audioPreferences: {
                entryAudio: userRecord.entryAudio,
                volume: userRecord.volume,
                playOnEntry: userRecord.playOnEntry,
                favorites: userRecord.favorites,
            },
        };

        return userAttributes;
    }
}
