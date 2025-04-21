import { Audio } from 'src/domain/entities/audio/audio.entity';
import { PostgresAudioCommand } from '../../postgres/tables/postgres-audio-command.table';
import { getValidatedDatabaseRecord } from '../../database-model.validator';
import { Mapper } from '../../types/mapper.interface';
import { AudioData } from 'src/domain/entities/audio/audio.types';

export class PostgresAudioCommandMapper implements Mapper<Audio, PostgresAudioCommand> {
    public async toEntity(document: Record<string, unknown>): Promise<Audio> {
        const validatedDocument = await getValidatedDatabaseRecord(PostgresAudioCommand, document);

        return Audio.fromData(this._toAudioAttributes(validatedDocument));
    }

    public toRecord(audioEntity: Audio): PostgresAudioCommand {
        const audioRecord: PostgresAudioCommand = {
            id: audioEntity.id,
            name: audioEntity.name,
            format: audioEntity.format,
            size: audioEntity.size,
            createdBy: audioEntity.createdBy,
            createdAt: audioEntity.createdAt,
            updatedAt: audioEntity.updatedAt,
        };

        return audioRecord;
    }

    private _toAudioAttributes(audioRecord: PostgresAudioCommand): AudioData {
        const audioAttributes: AudioData = {
            id: audioRecord.id,
            name: audioRecord.name,
            format: audioRecord.format,
            size: audioRecord.size,
            createdBy: audioRecord.createdBy,
            createdAt: audioRecord.createdAt,
            updatedAt: audioRecord.updatedAt,
        };

        return audioAttributes;
    }
}
