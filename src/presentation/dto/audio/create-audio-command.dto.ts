import { Transform } from 'class-transformer';
import { IsEnum, IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';
import { AudioFileFormat } from 'src/domain/entities/audio/audio.types';

export class CreateAudioRequestDTO {
    @IsString()
    @IsNotEmpty()
    @MinLength(3)
    @MaxLength(25)
    name: string;

    @IsEnum(AudioFileFormat)
    @Transform(({ value }) => value?.toLowerCase?.())
    format: AudioFileFormat;
}

export class AudioFileDTO {
    @IsNotEmpty()
    file: Buffer;
}
