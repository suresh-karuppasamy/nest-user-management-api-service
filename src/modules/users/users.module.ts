import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { User, UserSchema } from './schemas/user.schema';
import { CommonModule } from '../../common/common.module';
import { ConflictException } from '@nestjs/common';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    CommonModule,
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {
  constructor(private readonly usersService: UsersService) {}

  async onModuleInit() {
    // Check if user already exists
    const existingUser = await this.usersService.findByEmail('existing@example.com');
    if (existingUser) {
      throw new ConflictException('Email already exists');
    }
  }
} 