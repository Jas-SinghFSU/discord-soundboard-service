import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import {
    getValidatedDatabaseRecord,
    isValidDatabaseRecord,
} from '../../../../../src/infrastructure/database/postgres/database-model.validator';
import { IsString, IsNotEmpty, IsNumber } from 'class-validator';

jest.mock('class-transformer');
jest.mock('class-validator');

class TestModel {
    @IsString()
    @IsNotEmpty()
    public name: string;

    @IsNumber()
    public age: number;
}

describe('Database Model Validator', () => {
    beforeEach(() => {
        jest.resetAllMocks();
    });

    describe('getValidatedDatabaseRecord', () => {
        it('should return validated document when validation passes', async () => {
            const mockDocument = { name: 'John', age: 30 };
            const mockInstance = new TestModel();
            mockInstance.name = 'John';
            mockInstance.age = 30;

            (plainToInstance as jest.Mock).mockReturnValue(mockInstance);
            (validate as jest.Mock).mockResolvedValue([]);

            const result = await getValidatedDatabaseRecord(TestModel, mockDocument);

            expect(plainToInstance).toHaveBeenCalledWith(TestModel, mockDocument);
            expect(validate).toHaveBeenCalledWith(mockInstance);
            expect(result).toBe(mockInstance);
        });

        it('should throw error when validation fails', async () => {
            const mockDocument = { age: 'thirty' };
            const mockInstance = new TestModel();
            const mockErrors = [
                { property: 'name', constraints: { isNotEmpty: 'name should not be empty' } },
                { property: 'age', constraints: { isNumber: 'age must be a number' } },
            ];

            (plainToInstance as jest.Mock).mockReturnValue(mockInstance);
            (validate as jest.Mock).mockResolvedValue(mockErrors);

            await expect(getValidatedDatabaseRecord(TestModel, mockDocument)).rejects.toThrow(
                'Model validation failed: ' + mockErrors,
            );

            expect(plainToInstance).toHaveBeenCalledWith(TestModel, mockDocument);
            expect(validate).toHaveBeenCalledWith(mockInstance);
        });
    });

    describe('isValidDatabaseRecord', () => {
        it('should return true when validation passes', async () => {
            const mockDocument = { name: 'John', age: 30 };
            const mockInstance = new TestModel();
            mockInstance.name = 'John';
            mockInstance.age = 30;

            (plainToInstance as jest.Mock).mockReturnValue(mockInstance);
            (validate as jest.Mock).mockResolvedValue([]);

            const result = await isValidDatabaseRecord(TestModel, mockDocument);

            expect(plainToInstance).toHaveBeenCalledWith(TestModel, mockDocument);
            expect(validate).toHaveBeenCalledWith(mockInstance);
            expect(result).toBe(true);
        });

        it('should return false when validation fails', async () => {
            const mockDocument = { age: 'thirty' };
            const mockInstance = new TestModel();
            const mockErrors = [
                { property: 'name', constraints: { isNotEmpty: 'name should not be empty' } },
                { property: 'age', constraints: { isNumber: 'age must be a number' } },
            ];

            (plainToInstance as jest.Mock).mockReturnValue(mockInstance);
            (validate as jest.Mock).mockResolvedValue(mockErrors);

            const result = await isValidDatabaseRecord(TestModel, mockDocument);

            expect(plainToInstance).toHaveBeenCalledWith(TestModel, mockDocument);
            expect(validate).toHaveBeenCalledWith(mockInstance);
            expect(result).toBe(false);
        });
    });
});
