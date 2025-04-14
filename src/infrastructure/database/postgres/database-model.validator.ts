import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

export const getValidatedDatabaseRecord = async <T extends object>(
    model: new () => T,
    databaseDocument: unknown,
): Promise<T> => {
    const document = plainToInstance(model, databaseDocument);

    const errors = await validate(document);
    const hasErrors = errors.length > 0;

    if (hasErrors) {
        throw new Error(`Model validation failed: ${errors}`);
    }

    return document;
};

export const isValidDatabaseRecord = async <T extends object>(
    model: new () => T,
    databaseDocument: unknown,
): Promise<boolean> => {
    const document = plainToInstance(model, databaseDocument);

    const errors = await validate(document);
    const hasErrors = errors.length > 0;

    if (hasErrors) {
        return false;
    }

    return true;
};
