import { TalentProfile } from '../models';
import { createCompleteTalentProfile, sampleTalentProfiles } from '../examples/completeTalentProfile';
import { CandidateAnalyzerService } from '../services/candidateAnalyzerService';

/**
 * Demo script to showcase complete talent profile functionality
 */
export class TalentProfileDemo {
  private analyzerService: CandidateAnalyzerService;

  constructor() {
    this.analyzerService = new CandidateAnalyzerService();
  }

  /**
   * Create sample talent profiles for demonstration
   */
  async createSampleProfiles(): Promise<void> {
    console.log('🎭 Creating sample talent profiles...');

    try {
      // Clear existing demo profiles
      await TalentProfile.deleteMany({ 
        email: { $in: sampleTalentProfiles.map(p => p.email) }
      });

      // Create sample profiles
      for (const profileData of sampleTalentProfiles) {
        const profile = new TalentProfile(profileData);
        await profile.save();
        console.log(`✅ Created profile: ${profile.firstName} ${profile.lastName} - ${profile.title}`);
      }

      console.log(`🎉 Successfully created ${sampleTalentProfiles.length} sample profiles`);
    } catch (error) {
      console.error('❌ Error creating sample profiles:', error);
    }
  }

  /**
   * Demonstrate AI analysis on profiles
   */
  async demonstrateAIAnalysis(): Promise<void> {
    console.log('\n🤖 Demonstrating AI analysis...');

    try {
      const profiles = await TalentProfile.find({}).limit(3);

      for (const profile of profiles) {
        console.log(`\n📋 Analyzing profile: ${profile.firstName} ${profile.lastName}`);
        
        try {
          const profileData = {
            ...profile.toObject(),
            _id: profile._id?.toString()
          };
          
          const parsedProfile = await this.analyzerService.normalizeCandidateProfile(profileData);
          
          // Update profile with analysis
          profile.parsedProfile = parsedProfile;
          await profile.save();
          
          console.log(`  ✅ AI Analysis completed for ${profile.firstName}`);
          console.log(`  📊 Skills identified: ${parsedProfile.skills.length}`);
          console.log(`  💼 Years of experience: ${parsedProfile.yearsExp}`);
          console.log(`  🎓 Education entries: ${parsedProfile.education.length}`);
          console.log(`  📝 Summary: ${parsedProfile.summary || 'No summary available'}`);
          
        } catch (analysisError) {
          console.log(`  ⚠️  AI analysis failed for ${profile.firstName}:`, analysisError);
        }
      }
    } catch (error) {
      console.error('❌ Error in AI analysis demo:', error);
    }
  }

  /**
   * Showcase profile search and filtering
   */
  async demonstrateProfileSearch(): Promise<void> {
    console.log('\n🔍 Demonstrating profile search and filtering...');

    try {
      // Search by skills
      const reactDevelopers = await TalentProfile.find({ 
        skills: { $in: ['React'] }
      });
      console.log(`📱 Found ${reactDevelopers.length} React developers`);

      // Search by work type
      const fullTimeCandidates = await TalentProfile.find({ 
        workType: { $in: ['fulltime', 'both'] }
      });
      console.log(`💼 Found ${fullTimeCandidates.length} full-time candidates`);

      // Search by availability
      const immediateStarters = await TalentProfile.find({ 
        availability: 'immediate'
      });
      console.log(`⚡ Found ${immediateStarters.length} candidates available immediately`);

      // Search by title/keywords
      const seniorDevelopers = await TalentProfile.find({ 
        title: { $regex: 'Senior', $options: 'i' }
      });
      console.log(`👔 Found ${seniorDevelopers.length} senior-level professionals`);

      // Complex search with multiple criteria
      const fullStackDevOps = await TalentProfile.find({
        $and: [
          { skills: { $in: ['Node.js'] } },
          { skills: { $in: ['Docker'] } },
          { workType: { $in: ['both'] } }
        ]
      });
      console.log(`🔧 Found ${fullStackDevOps.length} full-stack DevOps engineers`);

    } catch (error) {
      console.error('❌ Error in profile search demo:', error);
    }
  }

  /**
   * Display profile statistics
   */
  async displayProfileStatistics(): Promise<void> {
    console.log('\n📊 Profile Statistics:');

    try {
      const totalProfiles = await TalentProfile.countDocuments();
      console.log(`👥 Total profiles: ${totalProfiles}`);

      // Skills distribution
      const allSkills = await TalentProfile.aggregate([
        { $unwind: '$skills' },
        { $group: { _id: '$skills', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ]);
      
      console.log('\n🛠️  Top Skills:');
      allSkills.forEach((skill: any) => {
        console.log(`  ${skill._id}: ${skill.count} profiles`);
      });

      // Work type distribution
      const workTypeStats = await TalentProfile.aggregate([
        { $group: { _id: '$workType', count: { $sum: 1 } } }
      ]);
      
      console.log('\n💼 Work Type Distribution:');
      workTypeStats.forEach((stat: any) => {
        console.log(`  ${stat._id}: ${stat.count} profiles`);
      });

      // Availability distribution
      const availabilityStats = await TalentProfile.aggregate([
        { $group: { _id: '$availability', count: { $sum: 1 } } }
      ]);
      
      console.log('\n📅 Availability Distribution:');
      availabilityStats.forEach((stat: any) => {
        console.log(`  ${stat._id}: ${stat.count} profiles`);
      });

      // Experience levels
      const profiles = await TalentProfile.find({});
      const experienceLevels = {
        junior: 0,
        mid: 0,
        senior: 0,
        lead: 0
      };

      profiles.forEach(profile => {
        const yearsExp = this.calculateTotalExperience(profile.experience);
        if (yearsExp < 3) experienceLevels.junior++;
        else if (yearsExp < 5) experienceLevels.mid++;
        else if (yearsExp < 8) experienceLevels.senior++;
        else experienceLevels.lead++;
      });

      console.log('\n📈 Experience Levels:');
      console.log(`  Junior (0-2 years): ${experienceLevels.junior}`);
      console.log(`  Mid (3-5 years): ${experienceLevels.mid}`);
      console.log(`  Senior (6-8 years): ${experienceLevels.senior}`);
      console.log(`  Lead (8+ years): ${experienceLevels.lead}`);

    } catch (error) {
      console.error('❌ Error generating statistics:', error);
    }
  }

  /**
   * Calculate total years of experience from experience array
   */
  private calculateTotalExperience(experience: any[]): number {
    let totalMonths = 0;
    const now = new Date();

    experience.forEach(exp => {
      const startDate = new Date(exp.startDate);
      const endDate = exp.endDate ? new Date(exp.endDate) : now;
      
      const months = (endDate.getFullYear() - startDate.getFullYear()) * 12 + 
                    (endDate.getMonth() - startDate.getMonth());
      totalMonths += Math.max(0, months);
    });

    return Math.round(totalMonths / 12);
  }

  /**
   * Run complete demo
   */
  async runCompleteDemo(): Promise<void> {
    console.log('🚀 Starting Complete Talent Profile Demo\n');
    
    await this.createSampleProfiles();
    await this.demonstrateAIAnalysis();
    await this.demonstrateProfileSearch();
    await this.displayProfileStatistics();
    
    console.log('\n✨ Demo completed successfully!');
  }
}

/**
 * Run demo if this file is executed directly
 */
if (require.main === module) {
  const demo = new TalentProfileDemo();
  demo.runCompleteDemo().catch(console.error);
}

export default TalentProfileDemo;
