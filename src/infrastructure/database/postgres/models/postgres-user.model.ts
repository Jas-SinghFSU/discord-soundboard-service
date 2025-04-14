export class PostgresUser {
    public id: string;
    public username: string;
    public display_name: string;
    public avatar: string | null;
    public provider: string;
    public entry_audio: string | null;
    public volume: number;
    public play_on_entry: boolean;
    public favorites: string[];
}
