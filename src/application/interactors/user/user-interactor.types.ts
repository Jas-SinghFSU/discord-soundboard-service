import { UpdateUserProps } from 'src/domain/entities/user/user.types';

export interface UpdateUserInteractorProps {
    id: string;
    userData: UpdateUserProps;
}
