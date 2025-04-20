import { Injectable } from '@nestjs/common';
import { Audio } from 'src/domain/entities/audio/audio.entity';
import { AudioResponseDto } from '../dto/audio/audio-response.dto';

@Injectable()
export class AudioConrollerMapper {
    public toDto(audioEntity: Audio): AudioResponseDto {
        return {
            id: audioEntity.id,
            name: audioEntity.name,
            format: audioEntity.format,
            size: audioEntity.size,
            createdBy: audioEntity.createdBy,
            createdAt: audioEntity.createdAt,
            updatedAt: audioEntity.updatedAt,
        };
    }
}
