export enum AudioFileFormat {
    MP3 = 'mp3',
    WAV = 'wav',
}

export interface CreateAudioProps {
    name: string;
    format: AudioFileFormat;
    size: number;
    createdBy: string;
}

export interface UpdateAudioProps {
    name: string;
}

export interface AudioData {
    id: string;
    name: string;
    format: AudioFileFormat;
    size: number;
    createdBy: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface AudioFileData {
    id: string;
    data: Buffer;
}
