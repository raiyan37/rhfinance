/**
 * User Model
 * 
 * CONCEPT: The User model stores user account information.
 * For now, we'll use a simple mock user for development.
 * Full authentication will be added later.
 * 
 * Key fields:
 * - email: Unique identifier for login
 * - password: Hashed password (never store plain text!)
 * - fullName: Display name
 * - balance: Current account balance (affected by pots)
 */

import mongoose, { Schema, Document, Types } from 'mongoose';
import bcrypt from 'bcrypt';

// TypeScript interface for User document
export interface IUser extends Document {
  _id: Types.ObjectId;
  email: string;
  password: string;
  fullName: string;
  balance: number;  // Current account balance
  avatarUrl?: string;
  verified: boolean;
  createdAt: Date;
  updatedAt: Date;
  // Instance methods
  comparePassword(candidatePassword: string): Promise<boolean>;
  omitPassword(): Partial<IUser>;
}

// Mongoose Schema
const userSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,  // Always store lowercase
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: [6, 'Password must be at least 6 characters'],
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    // Current account balance
    // This is updated when:
    // 1. Money is added to a pot (decreases)
    // 2. Money is withdrawn from a pot (increases)
    // 3. A pot is deleted (increases by pot total)
    balance: {
      type: Number,
      default: 0,
    },
    avatarUrl: {
      type: String,
    },
    verified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Index for email lookups
userSchema.index({ email: 1 });

/**
 * Pre-save Hook: Hash password before saving
 * 
 * CONCEPT: Mongoose "hooks" (middleware) run before/after certain operations.
 * This runs BEFORE saving, and hashes the password if it was modified.
 * 
 * bcrypt.hash() creates a secure one-way hash.
 * The "10" is the salt rounds (higher = more secure but slower).
 */
userSchema.pre('save', async function () {
  // Only hash if password was modified (or is new)
  if (!this.isModified('password')) {
    return;
  }
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

/**
 * Instance Method: Compare password
 * 
 * Used during login to check if the provided password matches.
 * bcrypt.compare() safely compares without revealing the hash.
 */
userSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

/**
 * Instance Method: Omit password from response
 * 
 * Returns user object without the password field.
 * Use this when sending user data to the client.
 */
userSchema.methods.omitPassword = function (): Partial<IUser> {
  const user = this.toObject();
  delete user.password;
  return user;
};

// Create and export the model
export const User = mongoose.model<IUser>('User', userSchema);

export default User;
