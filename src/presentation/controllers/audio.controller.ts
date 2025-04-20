import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthStrategy } from '../auth/auth.types';
import { GetAudioRequestDTO } from '../dto/audio/get-audio-command.dto';
import { AudioResponseDto } from '../dto/audio/audio-response.dto';
import { AudioService } from 'src/application/services/audio.service';
import { AudioConrollerMapper } from '../mappers/audio.mapper';

@Controller('audio')
export class AudioController {
    constructor(
        private readonly _audioService: AudioService,
        private readonly _audioMapper: AudioConrollerMapper,
    ) {}

    @Get(':id')
    @UseGuards(AuthGuard(AuthStrategy.DISCORD))
    public async getAudioCommand(@Param() getAudioRequestDto: GetAudioRequestDTO): Promise<AudioResponseDto> {
        const { id } = getAudioRequestDto;

        const audio = await this._audioService.getAudio(id);

        return this._audioMapper.toDto(audio);
    }
}
