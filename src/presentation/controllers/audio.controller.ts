import { Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthStrategy } from '../auth/auth.types';
import { GetAudioRequestDTO } from '../dto/audio/get-audio-command.dto';
import { AudioResponseDto } from '../dto/audio/audio-response.dto';
import { AudioService } from 'src/application/services/audio.service';
import { AudioConrollerMapper } from '../mappers/audio.mapper';
import { CreateAudioRequestDTO } from '../dto/audio/create-audio-command.dto';

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

    @Post()
    @UseGuards(AuthGuard(AuthStrategy.DISCORD))
    public async createAudioCommand(
        @Param() createAudioCommandRequestDto: CreateAudioRequestDTO,
    ): Promise<AudioResponseDto> {
        const createAudioCommand = this._audioMapper.toCreateCommand(createAudioCommandRequestDto);

        const audio = await this._audioService.createAudio(createAudioCommand);

        return this._audioMapper.toDto(audio);
    }
}
