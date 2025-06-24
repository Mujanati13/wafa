import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import * as bcrypt from 'bcrypt';

export type UserDocument = HydratedDocument<User>;

// Subscription subdocument schema
@Schema({ _id: false })
export class Subscription {
    @Prop({ 
        type: String, 
        enum: ['free', 'basic', 'premium', 'annual'],
        default: 'free'
    })
    plan: string;

    @Prop({ type: Date })
    startDate: Date;

    @Prop({ type: Date })
    endDate: Date;

    @Prop({ 
        type: String,
        enum: ['credit_card', 'paypal', 'bank_transfer', 'stripe']
    })
    paymentMethod: string;

    @Prop({ type: Boolean, default: false })
    isActive: boolean;
}

export const SubscriptionSchema = SchemaFactory.createForClass(Subscription);

@Schema({ 
    timestamps: true,
})
export class User {
    @Prop({ 
        required: true, 
        type: String,
        trim: true,
        minlength: 2,
        maxlength: 50
    })
    firstName: string;

    @Prop({ 
        required: true, 
        type: String,
        trim: true,
        minlength: 2,
        maxlength: 50
    })
    lastName: string;

    @Prop({ 
        required: true, 
        unique: true, 
        type: String,
        lowercase: true,
        trim: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    })
    email: string;

    @Prop({ 
        required: true, 
        type: String,
        minlength: 8,
        
    })
    password: string;

    @Prop({ 
        required: true, 
        type: String,
        default: 'student',
        enum: {
            values: ['student', 'admin', 'superAdmin'],
            message: 'Role must be either student, admin, or superAdmin'
        }
    })
    role: string;

    @Prop({ 
        required: true, 
        type: Boolean, 
        default: false 
    })
    isActive: boolean;

    @Prop({ 
        type: SubscriptionSchema,
        default: () => ({
            plan: 'free',
            isActive: false
        })
    })
    subscription: Subscription;
}

export const UserSchema = SchemaFactory.createForClass(User);

// Pre-save middleware  ( to hash password here)
UserSchema.pre<UserDocument>('save',  async function(next) {
    if (!this.isModified('password')) return next(); // Hash only if password is modified

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
    next();
});
