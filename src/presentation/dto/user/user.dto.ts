export interface UserDto {
    id: string;
    username: string;
    displayName: string;
    avatar: string | null;
    provider: string;
    audioPreferences: {
        entryAudio: string | null;
        volume: number;
        playOnEntry: boolean;
        favorites: string[];
    };
}
