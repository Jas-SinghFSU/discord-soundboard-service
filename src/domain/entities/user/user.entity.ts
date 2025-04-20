import { UpdateUserProps, UserAudioPreferences, CreateUserProps } from './user.types';

export class User {
    private readonly _id: string;
    private readonly _provider: string;
    private _username: string;
    private _displayName: string;
    private _avatar: string | null;
    private _audioPreferences: UserAudioPreferences;

    private constructor(userProps: CreateUserProps) {
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
    public static create(userProps: CreateUserProps): User {
        return new User(userProps);
    }

    /**
     * Re-hydrates a user instance from stored data.
     *
     * Used when retrieving a user from persistence, reconstructing the object from the stored properties.
     *
     * @param userProps The properties of the user from storage.
     * @returns A User instance representing the stored user.
     */
    public static fromData(userProps: CreateUserProps): User {
        return new User(userProps);
    }

    /**
     * Updates the user's mutable properties.
     *
     * Used to modify user attributes like username, display name, avatar, and audio preferences.
     * Only updates properties that are explicitly provided in the update props.
     *
     * @param props The properties to update on the user.
     */
    public update(props: UpdateUserProps): void {
        this._username = props.username ?? this._username;
        this._displayName = props.displayName ?? this._displayName;
        this._audioPreferences = props.audioPreferences ?? this._audioPreferences;

        if (props.avatar !== undefined) {
            this._avatar = props.avatar;
        }
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
