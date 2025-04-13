import { v7 as uuidV7 } from 'uuid';

export function generateUuid(): string {
    return uuidV7();
}
