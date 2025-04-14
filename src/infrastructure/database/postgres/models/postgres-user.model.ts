export class PostgresUser {
    public id: string;
    public username: string;
    public displayName: string;
    public avatar: string | null;
    public provider: string;
    public entryAudio: string | null;
    public volume: number;
    public playOnEntry: boolean;
    public favorites: string[];
}
