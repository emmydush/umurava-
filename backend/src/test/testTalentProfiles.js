/**
 * Simple test script to demonstrate complete talent profile functionality
 * Run with: node src/test/testTalentProfiles.js
 */

const { TalentProfile } = require('../../dist/models');
const { createCompleteTalentProfile, sampleTalentProfiles } = require('../../dist/examples/completeTalentProfile');

async function testTalentProfiles() {
  console.log('🎭 Testing Complete Talent Profile System\n');

  try {
    // Test 1: Create sample profiles
    console.log('📝 Test 1: Creating sample talent profiles...');
    
    for (const profileData of sampleTalentProfiles) {
      const profile = new TalentProfile(profileData);
      await profile.save();
      console.log(`✅ Created: ${profile.firstName} ${profile.lastName} - ${profile.title}`);
    }

    // Test 2: Search profiles
    console.log('\n🔍 Test 2: Searching profiles...');
    
    const reactDevs = await TalentProfile.find({ 
      skills: { $in: ['React'] }
    });
    console.log(`📱 Found ${reactDevs.length} React developers`);

    const seniorDevs = await TalentProfile.find({ 
      title: { $regex: 'Senior', $options: 'i' }
    });
    console.log(`👔 Found ${seniorDevs.length} senior professionals`);

    // Test 3: Profile statistics
    console.log('\n📊 Test 3: Profile statistics...');
    
    const totalProfiles = await TalentProfile.countDocuments();
    console.log(`👥 Total profiles: ${totalProfiles}`);

    const workTypeStats = await TalentProfile.aggregate([
      { $group: { _id: '$workType', count: { $sum: 1 } } }
    ]);
    
    console.log('💼 Work Type Distribution:');
    workTypeStats.forEach(stat => {
      console.log(`  ${stat._id}: ${stat.count} profiles`);
    });

    // Test 4: Display sample profile
    console.log('\n👤 Test 4: Sample profile details...');
    const sampleProfile = await TalentProfile.findOne();
    if (sampleProfile) {
      console.log(`Name: ${sampleProfile.firstName} ${sampleProfile.lastName}`);
      console.log(`Title: ${sampleProfile.title}`);
      console.log(`Skills: ${sampleProfile.skills.join(', ')}`);
      console.log(`Experience: ${sampleProfile.experience.length} positions`);
      console.log(`Education: ${sampleProfile.education.length} degrees`);
      console.log(`Availability: ${sampleProfile.availability}`);
      console.log(`Work Type: ${sampleProfile.workType}`);
    }

    console.log('\n✨ All tests completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run tests
testTalentProfiles().then(() => {
  console.log('\n🎉 Talent profile system test completed!');
  process.exit(0);
}).catch(error => {
  console.error('💥 Test failed:', error);
  process.exit(1);
});
