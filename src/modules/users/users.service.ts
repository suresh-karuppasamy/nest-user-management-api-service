import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import * as nodemailer from 'nodemailer';
import { User, UserRole } from './schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { QueryDto } from '../../common/dto/query.dto';
import { PaginatedResponse } from '../../common/interfaces/paginated-response.interface';
import { QueryBuilderService } from '../../common/services/query-builder.service';

@Injectable()
export class UsersService {
  private transporter: nodemailer.Transporter;

  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private configService: ConfigService,
    private queryBuilderService: QueryBuilderService,
  ) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get('MAIL_HOST'),
      port: this.configService.get('MAIL_PORT'),
      secure: this.configService.get('MAIL_SECURE') === 'true',
      auth: {
        user: this.configService.get('MAIL_USER'),
        pass: this.configService.get('MAIL_PASS'),
      },
      tls: {
        rejectUnauthorized: false, // Only use this in development
      },
    });
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    const { email, password } = createUserDto;

    // Check if user already exists
    const existingUser = await this.userModel.findOne({ email });
    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await this.userModel.create({
      ...createUserDto,
      password: hashedPassword,
    });

    // Send invitation email
    try {
      await this.sendInvitationEmail(user);
    } catch (error) {
      console.error('Failed to send invitation email:', error);
      // Don't throw error, just log it
    }

    return user;
  }

  async findAll(queryDto: QueryDto): Promise<PaginatedResponse<User>> {
    const { filter, sort, select, skip, limit } = this.queryBuilderService.buildQuery(queryDto, this.userModel);

    const [users, total] = await Promise.all([
      this.userModel
        .find(filter)
        .select(select)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .exec(),
      this.userModel.countDocuments(filter).exec(),
    ]);

    const totalPages = Math.ceil(total / limit);
    const hasNextPage = queryDto.page < totalPages;
    const hasPreviousPage = queryDto.page > 1;

    return {
      data: users,
      meta: {
        total,
        page: queryDto.page,
        limit,
        totalPages,
        hasNextPage,
        hasPreviousPage,
      },
    };
  }

  async findOne(id: string): Promise<User> {
    const user = await this.userModel.findById(id).select('-password').exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userModel.findOne({ email }).exec();
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
    }
    const updatedUser = await this.userModel
      .findByIdAndUpdate(id, updateUserDto, { new: true })
      .exec();
    if (!updatedUser) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return updatedUser;
  }

  async remove(id: string): Promise<void> {
    const result = await this.userModel.deleteOne({ _id: id }).exec();
    if (result.deletedCount === 0) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
  }

  private async sendInvitationEmail(user: User): Promise<void> {
    const resetToken = await this.generateResetToken(user);
    const resetUrl = `${this.configService.get('FRONTEND_URL')}/reset-password/${resetToken}`;

    await this.transporter.sendMail({
      from: this.configService.get('MAIL_USER'),
      to: user.email,
      subject: 'Welcome to Our Platform',
      html: `
        <h2>Welcome to Our Platform!</h2>
        <p>Dear ${user.firstName},</p>
        <p>You have been invited to join our platform. Please click the link below to set up your password:</p>
        <p><a href="${resetUrl}">Set Up Password</a></p>
        <p>If you did not request this invitation, please ignore this email.</p>
        <p>Best regards,<br>Your Team</p>
      `,
    });
  }

  private async generateResetToken(user: User): Promise<string> {
    const resetToken = Math.random().toString(36).substring(2, 15);
    const hashedToken = await bcrypt.hash(resetToken, 10);

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    await user.save();

    return resetToken;
  }
} 