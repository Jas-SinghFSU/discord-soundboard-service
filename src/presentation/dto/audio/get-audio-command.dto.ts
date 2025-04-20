import { IsUUID } from 'class-validator';
import { UUID_VERSION } from 'src/shared/utils/uuid.utils';

export class GetAudioRequestDTO {
    @IsUUID(UUID_VERSION)
    id: string;
}
