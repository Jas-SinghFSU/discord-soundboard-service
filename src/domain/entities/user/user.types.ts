export interface CreateUserProps {
    provider: string;
    id: string;
    username: string;
    avatar?: string | null;
    displayName: string;

    audioPreferences?: UserAudioPreferences;
}

export interface UpdateUserProps extends Partial<Omit<CreateUserProps, 'provider'>> {}

export interface UserAudioPreferences {
    entryAudio: string | null;
    volume: number;
    playOnEntry: boolean;
    favorites: string[];
}
