const mongoose = require('mongoose');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/umurava')
  .then(() => {
    console.log('Connected to MongoDB');
    
    // Direct MongoDB update
    mongoose.connection.db.collection('users').updateMany(
      { role: { $nin: ['talent', 'recruiter', 'admin'] } },
      { $set: { role: 'talent' } }
    ).then(result => {
      console.log(`Updated ${result.modifiedCount} users to 'talent' role`);
      
      // Check current users
      mongoose.connection.db.collection('users').find({}).toArray()
        .then(users => {
          console.log('\nCurrent users:');
          users.forEach(user => {
            console.log(`- ${user.email}: ${user.role}`);
          });
          process.exit(0);
        });
    })
    .catch(err => {
      console.error('Error updating users:', err);
      process.exit(1);
    });
  })
  .catch(err => {
    console.error('Error connecting to MongoDB:', err);
    process.exit(1);
  });
