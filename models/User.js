import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const UserSchema = new mongoose.Schema({
  googleId: {
    type: String,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  password: {
    type: String,
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user',
  },
  displayName: {
    type: String,
    required: true,
  },
  profileImage: {
    type: String,
    default: '/img/default-avatar.png',
  },
  galleryImages: {
    type: [String],
  },
  dob: {
    type: Date,
  },
  age: {
    type: Number,
  },
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Non-binary', 'Other'],
  },
  location: {
    type: String,
  },
  preferences: {
    gender: {
      type: [String],
      enum: ['Male', 'Female', 'Non-binary', 'Other', 'Everyone'],
      default: ['Everyone'],
    },
    ageRange: {
      min: { type: Number, default: 18 },
      max: { type: Number, default: 99 },
    },
  },
  work: {
    type: String,
  },
  bio: {
    type: String,
    maxlength: 500,
  },
  interests: {
    type: [String],
  },
  onboardingComplete: {
    type: Boolean,
    default: false,
  },
  phoneNumber: {
    type: String,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  otp: {
    type: String,
  },
  otpExpires: {
    type: Date,
  },
  emailVerificationToken: String,
  emailVerificationExpires: Date,
  status: {
    type: String,
    enum: ['active', 'banned'],
    default: 'active',
  },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  dislikes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  matches: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  blockedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  passwordResetToken: String,
  passwordResetExpires: Date,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Password hashing middleware
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) {
    return next();
  }
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// Method to compare password for login
UserSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', UserSchema);

export default User;