import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { Contact } from './schemas/contact.schema';
import { CreateContactDto } from './dto/create-contact.dto';

@Injectable()
export class ContactService {
  private transporter: nodemailer.Transporter;

  constructor(
    @InjectModel(Contact.name) private contactModel: Model<Contact>,
    private configService: ConfigService,
  ) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get('MAIL_HOST'),
      port: this.configService.get('MAIL_PORT'),
      secure: true,
      auth: {
        user: this.configService.get('MAIL_USER'),
        pass: this.configService.get('MAIL_PASS'),
      },
    });
  }

  async create(createContactDto: CreateContactDto): Promise<Contact> {
    const contact = await this.contactModel.create(createContactDto);
    
    // Send email to admin
    await this.transporter.sendMail({
      from: this.configService.get('MAIL_USER'),
      to: this.configService.get('ADMIN_EMAIL'),
      subject: 'New Contact Form Submission',
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${contact.firstName} ${contact.lastName}</p>
        <p><strong>Email:</strong> ${contact.email}</p>
        <p><strong>Phone:</strong> ${contact.phoneNumber || 'Not provided'}</p>
        <p><strong>Message:</strong> ${contact.description}</p>
      `,
    });

    // Send acknowledgment email
    await this.transporter.sendMail({
      from: this.configService.get('MAIL_USER'),
      to: contact.email,
      subject: 'Thank you for contacting us',
      html: `
        <h2>Thank you for contacting us!</h2>
        <p>Dear ${contact.firstName},</p>
        <p>We have received your message and will get back to you soon.</p>
        <p>Best regards,<br>Your Team</p>
      `,
    });

    contact.isAcknowledged = true;
    return contact.save();
  }

  async findAll(): Promise<Contact[]> {
    return this.contactModel.find().exec();
  }
} 