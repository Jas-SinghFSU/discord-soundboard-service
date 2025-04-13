export interface UserProps {
    provider: string;
    id: string;
    username: string;
    avatar?: string | null;
    displayName: string;

    audioPreferences?: UserAudioPreferences;
}

export interface NewUserProps extends Omit<UserProps, 'id'> {}

export interface UserAudioPreferences {
    entryAudio: string | null;
    volume: number;
    playOnEntry: boolean;
    favorites: string[];
}
