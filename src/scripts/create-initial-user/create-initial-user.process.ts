// cmd: node dist/scripts/create-initial-user/create-initial-user.process.js
import { INestApplication, Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';

import {
  USER_INITIAL_EMAIL,
  USER_INITIAL_PASSWORD,
  USER_INITIAL_ROLE,
} from '../../config/config.provider';
import { RolesService } from '../../modules/roles/roles.service';
import { UsersService } from '../../modules/users/users.service';
import { CreateInitialUserModule } from './create-initial-user.module';

export class CreateInitialUserProgram {
  private readonly logger = new Logger(CreateInitialUserProgram.name);
  private app: INestApplication;
  private usersService: UsersService;
  private rolesService: RolesService;

  async main() {
    try {
      await this.initialize();
      await this.process();
    } catch (error) {
      this.logger.error(
        `Error in CreateInitialUserProgram: ${error.message}`,
        error.stack,
      );
      throw error;
    } finally {
      await this.app?.close();
    }
  }

  private async initialize() {
    this.logger.log('Initializing application');

    this.app = await NestFactory.create<NestExpressApplication>(
      CreateInitialUserModule,
    );

    this.usersService = this.app.get<UsersService>(UsersService);
    this.rolesService = this.app.get<RolesService>(RolesService);

    this.logger.log('Application initialization complete');
  }

  private async process() {
    try {
      this.logger.log('Starting initial user creation process');

      const role = await this.rolesService.createRole({
        name: USER_INITIAL_ROLE,
        description: 'create via initial user process script',
      });

      const user = await this.usersService.createUser({
        email: USER_INITIAL_EMAIL,
        password: USER_INITIAL_PASSWORD,
        role: role.id,
      });

      this.logger.log(`User document... `, user);
      this.logger.log(`Initial user created successfully: ${user.email}`);
    } catch (error) {
      this.logger.error(
        `Failed to create initial user: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }
}

(async () => {
  try {
    await new CreateInitialUserProgram().main();
    process.exit(0);
  } catch (err) {
    console.error('Failed to create initial user:', err);
    process.exit(1);
  }
})();
