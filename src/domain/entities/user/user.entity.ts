import { generateUuid } from 'src/shared/utils/uuid.utils';
import { NewUserEntityProps, UpdateUserProps, UserAudioPreferences, UserAttributes } from './user.types';

export class User {
    private readonly _id: string;
    private readonly _provider: string;
    private _username: string;
    private _displayName: string;
    private _avatar: string | null;
    private _audioPreferences: UserAudioPreferences;

    private constructor(userProps: UserAttributes) {
        this._id = userProps.id;
        this._username = userProps.username;
        this._displayName = userProps.displayName;
        this._avatar = userProps.avatar ?? null;
        this._provider = userProps.provider;

        const defaultEntryAudio = null;
        const defaultVolume = 100;
        const defaultPlayOnEntry = false;
        const defaultFavorites: string[] = [];

        this._audioPreferences = {
            entryAudio: userProps.audioPreferences?.entryAudio ?? defaultEntryAudio,
            volume: userProps.audioPreferences?.volume ?? defaultVolume,
            playOnEntry: userProps.audioPreferences?.playOnEntry ?? defaultPlayOnEntry,
            favorites: userProps.audioPreferences?.favorites ?? defaultFavorites,
        };
    }

    /**
     * Creates a new user instance with a newly generated UUID.
     *
     * Used when a new user is registered, ensuring a unique identifier and default audio preferences.
     *
     * @param userProps The properties for initializing the new user.
     * @returns A new User instance.
     */
    public static create(userProps: NewUserEntityProps): User {
        const newId = generateUuid();
        const newUserProps: UserAttributes = {
            id: newId,
            ...userProps,
        };

        return new User(newUserProps);
    }

    /**
     * Re-hydrates a user instance from stored data.
     *
     * Used when retrieving a user from persistence, reconstructing the object from the stored properties.
     *
     * @param userProps The properties of the user from storage.
     * @returns A User instance representing the stored user.
     */
    public static fromData(userProps: UserAttributes): User {
        return new User(userProps);
    }

    public update(props: UpdateUserProps): void {
        if (props.username !== undefined) this._username = props.username;
        if (props.displayName !== undefined) this._displayName = props.displayName;
        if (props.avatar !== undefined) this._avatar = props.avatar;
        if (props.audioPreferences !== undefined) this._audioPreferences = props.audioPreferences;
    }

    public get id(): string {
        return this._id;
    }

    public get username(): string {
        return this._username;
    }

    public get displayName(): string {
        return this._displayName;
    }

    public get avatar(): string | null {
        return this._avatar;
    }

    public get provider(): string {
        return this._provider;
    }

    public get audioPreferences(): UserAudioPreferences {
        return this._audioPreferences;
    }
}
