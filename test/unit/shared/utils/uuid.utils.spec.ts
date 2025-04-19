import { generateUuid } from 'src/shared/utils/uuid.utils';

describe('UUID Utils', () => {
    it('should generate a valid UUID v7', () => {
        const uuid = generateUuid();

        const uuidV7Regex = /^[0-7][0-9A-F]{7}-[0-9A-F]{4}-7[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i;

        expect(uuid).toMatch(uuidV7Regex);
    });

    it('should generate unique UUIDs', () => {
        const uuid1 = generateUuid();
        const uuid2 = generateUuid();

        expect(uuid1).not.toBe(uuid2);
    });

    it('should generate timestamp-ordered UUIDs', () => {
        const uuid1 = generateUuid();
        const uuid2 = generateUuid();

        expect(uuid2 > uuid1).toBeTruthy();
    });
});
