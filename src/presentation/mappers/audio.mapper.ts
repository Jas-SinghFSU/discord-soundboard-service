import { Injectable } from '@nestjs/common';
import { Audio } from 'src/domain/entities/audio/audio.entity';
import { AudioResponseDto } from '../dto/audio/audio-response.dto';
import { CreateAudioRequestDTO } from '../dto/audio/create-audio-command.dto';
import { CreateAudioCommand } from 'src/application/interactors/audio/audio-interactor.types';

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

    public toCreateCommand(dto: CreateAudioRequestDTO): CreateAudioCommand {
        return {
            audioProps: {
                name: dto.name,
                format: dto.format,
            },
            audioFile: dto.file,
        };
    }
}
