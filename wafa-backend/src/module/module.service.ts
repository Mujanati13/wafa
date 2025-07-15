import { Injectable } from '@nestjs/common';
import { CreateModuleDto } from './dto/create-module.dto';
import { UpdateModuleDto } from './dto/update-module.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Module } from './schemas/module.schema';
import { Model } from 'mongoose';

@Injectable()
export class ModuleService {
  constructor(
    @InjectModel(Module.name) private moduleModel: Model<Module>,
  ) {}

  async create(createModuleDto: CreateModuleDto) {
    const module = await this.moduleModel.create(createModuleDto);
    return module;
  }

  async findAll() {
    const modules = await this.moduleModel.find();
    return modules;
  }

  async findOne(id: string) {
    const module = await this.moduleModel.findById(id);
    return module;
  }

  async update(id: string, updateModuleDto: UpdateModuleDto) {
    const module = await this.moduleModel.findByIdAndUpdate(id, updateModuleDto, {
      new: true,
    });
    return module;
  }

  async remove(id: string) {
    await this.moduleModel.findByIdAndDelete(id);
    return { message: 'Module deleted successfully' };
  }
}
