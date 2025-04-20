import { v7 as uuidV7 } from 'uuid';

export const UUID_VERSION = '7';

export function generateUuid(): string {
    return uuidV7();
}
