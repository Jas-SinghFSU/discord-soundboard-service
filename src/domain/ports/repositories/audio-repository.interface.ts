import { Audio } from 'src/domain/entities/audio/audio.entity';

export interface AudioRepository {
    findOneById(id: string): Promise<Audio | undefined>;
}
