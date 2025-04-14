export interface UserAttributes {
    provider: string;
    id: string;
    username: string;
    avatar?: string | null;
    displayName: string;

    audioPreferences?: UserAudioPreferences;
}
export interface UpdateUserProps extends Partial<Omit<UserAttributes, 'id' | 'provider'>> {}

export interface NewUserEntityProps extends Omit<UserAttributes, 'id'> {}

export interface UserAudioPreferences {
    entryAudio: string | null;
    volume: number;
    playOnEntry: boolean;
    favorites: string[];
}
