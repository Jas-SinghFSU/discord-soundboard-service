import { generateUuid } from 'src/shared/utils/uuid.utils';
import { AudioData, AudioFileFormat, CreateAudioProps, UpdateAudioProps } from './audio.types';

export class Audio {
    private readonly _id: string;
    private readonly _format: AudioFileFormat;
    private readonly _size: number;
    private readonly _createdBy: string;
    private readonly _createdAt: Date;

    private _name: string;
    private _updatedAt: Date;

    private constructor(audioData: AudioData) {
        this._id = audioData.id;
        this._name = audioData.name;
        this._format = audioData.format;
        this._size = audioData.size;
        this._createdBy = audioData.createdBy;
        this._createdAt = audioData.createdAt;
        this._updatedAt = audioData.updatedAt;
    }

    /**
     * Creates a new audio instance
     *
     * Used when a new audio command is created/uploaded
     *
     * @param audioProps The properties for creating the new audio command.
     * @returns A new Audio instance.
     */
    public static create(audioProps: CreateAudioProps): Audio {
        const id = generateUuid();
        const timestamp = new Date();

        return new Audio({
            id,
            ...audioProps,
            createdAt: timestamp,
            updatedAt: timestamp,
        });
    }

    /**
     * Re-hydrates an audio command metadata from stored data.
     *
     * Used when retrieving an audio command from persistence, reconstructing the object from the stored properties.
     *
     * @param audioData The properties of the audio command metadata from storage.
     * @returns An Audio instance representing the stored audio command.
     */
    public static fromData(audioData: AudioData): Audio {
        return new Audio(audioData);
    }

    /**
     * Updates an audio command's mutable properties
     *
     * Used when modifying existing audio command metadata, currently supporting name updates
     *
     * @param props The properties to update on the audio command.
     */
    public update(props: UpdateAudioProps): void {
        this._name = props.name ?? this._name;

        this._updatedAt = new Date();
    }

    public get id(): string {
        return this._id;
    }

    public get name(): string {
        return this._name;
    }

    public get format(): AudioFileFormat {
        return this._format;
    }

    public get size(): number {
        return this._size;
    }

    public get createdBy(): string {
        return this._createdBy;
    }

    public get createdAt(): Date {
        return this._createdAt;
    }

    public get updatedAt(): Date {
        return this._updatedAt;
    }
}
