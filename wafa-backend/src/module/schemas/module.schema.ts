import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({
    timestamps: true,
})
export class Module {
  @Prop({
    required: true,
    type: String,
    trim: true,
    minlength: 2,
    maxlength: 50,
  })
  title: string;

  @Prop({
    required: true,
    type: String,
    trim: true
  })
  description: string;

  @Prop({
    required: true,
    type: String,
    trim: true,
    minlength: 2,
    maxlength: 50,
  })
  academicYear: string;

  @Prop({
    required: true,
    type: String,
    trim: true,
    minlength: 2,
    maxlength: 50,
  })
  specialization: string;

 
}

export const ModuleSchema = SchemaFactory.createForClass(Module);

