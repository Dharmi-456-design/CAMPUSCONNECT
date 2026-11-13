const Note = require('../models/Note');
const TeamPost = require('../models/TeamPost');
const Doubt = require('../models/Doubt');
const MarketplaceListing = require('../models/MarketplaceListing');

/**
 * Service providing rule-based recommendations and real campus statistics
 * for the student dashboard.
 */
const getRecommendationsForUser = async (user) => {
  const { branch, semester, skills = [], _id: userId } = user;

  // 1. Recommend approved notes matching user's branch/semester or matching skills in tags
  let noteFilter = {
    approvalStatus: 'approved'
  };

  if (branch || (skills && skills.length > 0)) {
    noteFilter.$or = [
      ...(branch && semester ? [{ branch, semester }] : []),
      ...(branch ? [{ branch }] : []),
      ...(skills.length > 0 ? [{ tags: { $in: skills } }] : [])
    ];
  }

  let recommendedNotes = await Note.find(noteFilter)
    .populate('uploader', 'name college branch photoUrl')
    .sort({ downloadCount: -1, createdAt: -1 })
    .limit(10);

  // Fallback: If no strict branch match, return latest approved campus notes
  if (recommendedNotes.length === 0) {
    recommendedNotes = await Note.find({ approvalStatus: 'approved' })
      .populate('uploader', 'name college branch photoUrl')
      .sort({ createdAt: -1 })
      .limit(10);
  }

  // 2. Recommend open team posts matching user's branch or required skills
  let teamFilter = {
    status: 'open'
  };

  if (branch || (skills && skills.length > 0)) {
    teamFilter.$or = [
      ...(branch ? [{ department: branch }] : []),
      ...(skills.length > 0 ? [{ requiredSkills: { $in: skills } }] : [])
    ];
  }

  let recommendedTeamPosts = await TeamPost.find(teamFilter)
    .populate('owner', 'name college branch photoUrl')
    .sort({ createdAt: -1 })
    .limit(10);

  if (recommendedTeamPosts.length === 0) {
    recommendedTeamPosts = await TeamPost.find({ status: 'open' })
      .populate('owner', 'name college branch photoUrl')
      .sort({ createdAt: -1 })
      .limit(10);
  }

  // 3. Real Student Counts from MongoDB Collections
  const [totalNotesInDb, totalDoubtsInDb, userNotesCount, userDoubtsCount, totalMarketplaceCount] = await Promise.all([
    Note.countDocuments({ approvalStatus: 'approved' }),
    Doubt.countDocuments({}),
    Note.countDocuments({ uploader: userId }),
    Doubt.countDocuments({ student: userId }),
    MarketplaceListing.countDocuments({ status: 'available' })
  ]);

  return {
    notes: recommendedNotes,
    teamPosts: recommendedTeamPosts,
    stats: {
      totalNotes: totalNotesInDb,
      totalDoubts: totalDoubtsInDb,
      totalListings: totalMarketplaceCount,
      userNotes: userNotesCount,
      userDoubts: userDoubtsCount,
      userPoints: user.points || 120
    }
  };
};

module.exports = {
  getRecommendationsForUser
};
