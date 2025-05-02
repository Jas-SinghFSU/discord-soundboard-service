import { UserRoles } from './roles-provider.types';

export interface UserRolesProvider {
    /**
     * Retrieves roles for a user in a specific discord server
     *
     * @param userId The user identifier
     * @returns Roles assigned to the user
     */
    getUserRoles(userId: string): Promise<UserRoles>;
}
