import { Audio } from 'src/domain/entities/audio/audio.entity';
import { PostgresAudioCommand } from '../../postgres/tables/postgres-audio-command.table';
import { getValidatedDatabaseRecord } from '../../database-model.validator';
import { Mapper } from '../../types/mapper.interface';
import { AudioData, AudioFileData } from 'src/domain/entities/audio/audio.types';
import { PostgresAudioData } from '../../postgres/tables';

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
            created_by: audioEntity.createdBy,
            created_at: audioEntity.createdAt,
            updated_at: audioEntity.updatedAt,
        };

        return audioRecord;
    }

    public toAudioFileData(audioData: PostgresAudioData): AudioFileData {
        const audioFileData: AudioFileData = {
            id: audioData.id,
            data: audioData.data,
        };

        return audioFileData;
    }

    private _toAudioAttributes(audioRecord: PostgresAudioCommand): AudioData {
        const audioAttributes: AudioData = {
            id: audioRecord.id,
            name: audioRecord.name,
            format: audioRecord.format,
            size: audioRecord.size,
            createdBy: audioRecord.created_by,
            createdAt: audioRecord.created_at,
            updatedAt: audioRecord.updated_at,
        };

        return audioAttributes;
    }
}
