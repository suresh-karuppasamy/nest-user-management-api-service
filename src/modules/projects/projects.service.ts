import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Project } from './schemas/project.schema';
import { CreateProjectDto } from './dto/create-project.dto';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectModel(Project.name) private projectModel: Model<Project>,
  ) {}

  async create(createProjectDto: CreateProjectDto): Promise<Project> {
    const project = await this.projectModel.create(createProjectDto);
    return project.populate(['client', 'teamMembers']);
  }

  async findAll(): Promise<Project[]> {
    return this.projectModel
      .find()
      .populate(['client', 'teamMembers'])
      .exec();
  }

  async findOne(id: string): Promise<Project> {
    const project = await this.projectModel
      .findById(id)
      .populate(['client', 'teamMembers'])
      .exec();
    if (!project) {
      throw new NotFoundException('Project not found');
    }
    return project;
  }

  async update(id: string, updateProjectDto: Partial<CreateProjectDto>): Promise<Project> {
    const project = await this.projectModel
      .findByIdAndUpdate(id, updateProjectDto, { new: true })
      .populate(['client', 'teamMembers'])
      .exec();
    if (!project) {
      throw new NotFoundException('Project not found');
    }
    return project;
  }

  async remove(id: string): Promise<void> {
    const result = await this.projectModel.deleteOne({ _id: id }).exec();
    if (result.deletedCount === 0) {
      throw new NotFoundException('Project not found');
    }
  }

  async addTeamMember(projectId: string, userId: string): Promise<Project> {
    const project = await this.projectModel
      .findByIdAndUpdate(
        projectId,
        { $addToSet: { teamMembers: userId } },
        { new: true },
      )
      .populate(['client', 'teamMembers'])
      .exec();
    if (!project) {
      throw new NotFoundException('Project not found');
    }
    return project;
  }

  async removeTeamMember(projectId: string, userId: string): Promise<Project> {
    const project = await this.projectModel
      .findByIdAndUpdate(
        projectId,
        { $pull: { teamMembers: userId } },
        { new: true },
      )
      .populate(['client', 'teamMembers'])
      .exec();
    if (!project) {
      throw new NotFoundException('Project not found');
    }
    return project;
  }
} 