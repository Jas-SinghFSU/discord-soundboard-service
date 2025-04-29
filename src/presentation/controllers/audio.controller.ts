import { Body, Controller, Get, Param, Post, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { GetAudioRequestDTO } from '../dto/audio/get-audio-command.dto';
import { AudioResponseDto } from '../dto/audio/audio-response.dto';
import { AudioService } from 'src/application/services/audio.service';
import { AudioConrollerMapper } from '../mappers/audio.mapper';
import { CreateAudioRequestDTO } from '../dto/audio/create-audio-command.dto';
import { AuthenticatedGuard } from '../auth/guards/authentication.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthUser } from '../decorators/user.decorator';
import { User } from 'src/domain/entities/user/user.entity';

@Controller('audio')
export class AudioController {
    constructor(
        private readonly _audioService: AudioService,
        private readonly _audioMapper: AudioConrollerMapper,
    ) {}

    @Get(':id')
    @UseGuards(AuthenticatedGuard)
    public async getAudioCommand(@Param() getAudioRequestDto: GetAudioRequestDTO): Promise<AudioResponseDto> {
        const { id } = getAudioRequestDto;

        const audio = await this._audioService.getAudio(id);

        return this._audioMapper.toDto(audio);
    }

    @Post()
    @UseGuards(AuthenticatedGuard)
    @UseInterceptors(FileInterceptor('file'))
    public async createAudioCommand(
        @Body() createAudioCommandRequestDto: CreateAudioRequestDTO,
        @UploadedFile() file: Express.Multer.File,
    ): Promise<AudioResponseDto> {
        const createAudioCommand = this._audioMapper.toCreateCommand(
            createAudioCommandRequestDto,
            file.buffer,
        );

        const audio = await this._audioService.createAudio(createAudioCommand);

        return this._audioMapper.toDto(audio);
    }

    @Post(':id/play')
    @UseGuards(AuthenticatedGuard)
    public async playAudio(
        @Param('id') audioId: string,
        @Body() playRequest: { channelId: string },
        @AuthUser() user: User,
    ): Promise<void> {
        const { id: userId } = user;
        const { volume } = user.audioPreferences;
        await this._audioService.playAudio(audioId, playRequest.channelId, userId, volume);
    }
}
