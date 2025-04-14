/**
 * Provides a contract for mapping between a persistence document (D) and a domain entity (E).
 *
 * This interface enforces that any implementing mapper converts raw data obtained from
 * a storage system into the corresponding domain entity, and vice versa. This abstraction
 * helps separate persistence logic from business logic.
 *
 * @template E The domain entity type.
 * @template D The document type (the persistence format).
 */
export interface Mapper<E, D> {
    /**
     * Converts a raw document into a domain entity.
     *
     * This method allows transforming the persistence representation (e.g., a database row or JSON object)
     * into a rich domain model (entity) that encapsulates business logic.
     *
     * @param document The raw document data as key-value pairs.
     * @returns A promise resolving to the corresponding domain entity.
     */
    toEntity(document: Record<string, unknown>): Promise<E>;

    /**
     * Converts a domain entity into a persistence document.
     *
     * This method transforms a domain entity back into a format suitable for storage,
     * such as a database record or JSON document.
     *
     * @param entity The domain entity to be converted.
     * @returns The document representation of the entity.
     */
    toRecord(entity: E): D;
}
