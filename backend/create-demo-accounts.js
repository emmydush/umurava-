const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Define User schema (same as in the backend)
const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, minlength: 6 },
  role: { type: String, enum: ['recruiter', 'talent', 'admin'], default: 'talent' },
  firstName: { type: String, required: true, trim: true },
  lastName: { type: String, required: true, trim: true }
}, { timestamps: true });

UserSchema.pre('save', async function() {
  if (!this.isModified('password')) return;
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  } catch (error) {
    throw error;
  }
});

const User = mongoose.model('User', UserSchema);

async function createDemoAccounts() {
  try {
    await mongoose.connect('mongodb://localhost:27017/umurava-ai-hackathon');
    console.log('Connected to MongoDB');
    
    const demoAccounts = [
      {
        email: 'recruiter@company.com',
        password: 'password123',
        firstName: 'Demo',
        lastName: 'Recruiter',
        role: 'recruiter'
      },
      {
        email: 'talent@example.com',
        password: 'password123',
        firstName: 'Demo',
        lastName: 'Talent',
        role: 'talent'
      }
    ];
    
    console.log('\nCreating demo accounts...');
    
    for (const account of demoAccounts) {
      try {
        const existingUser = await User.findOne({ email: account.email });
        if (existingUser) {
          console.log(`✓ ${account.email} already exists`);
        } else {
          const user = new User(account);
          await user.save();
          console.log(`✓ Created ${account.email} (${account.role})`);
        }
      } catch (error) {
        console.error(`✗ Failed to create ${account.email}:`, error.message);
      }
    }
    
    // Show all users
    const allUsers = await User.find().select('email firstName lastName role createdAt');
    console.log('\n=== All Users ===');
    allUsers.forEach(user => {
      console.log(`- ${user.email} (${user.role}) - ${user.firstName} ${user.lastName}`);
    });
    
    console.log('\n✓ Demo accounts setup complete!');
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
}

createDemoAccounts();
