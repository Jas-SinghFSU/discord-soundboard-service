import { ConfigModule } from '@nestjs/config';
import * as path from 'path';

const envFile = path.resolve(__dirname, '../.env');

ConfigModule.forRoot({ envFilePath: envFile });
