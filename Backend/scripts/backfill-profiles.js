const mongoose = require('mongoose');
const { connectToMongoDB } = require('../utils/mongoConnect');
const Profile = require('../schemas/profile.schema');
const User = require('../schemas/user.schema');
const { createProfileForUser } = require('../services/profile.service');

const run = async () => {
  await connectToMongoDB();

  const users = await User.find()
    .select('username picture bio')
    .lean();
  const existingProfiles = await Profile.find()
    .select('userId')
    .lean();
  const existingUserIds = new Set(
    existingProfiles.map(profile => profile.userId.toString())
  );

  let createdCount = 0;
  for (const user of users) {
    if (existingUserIds.has(user._id.toString())) continue;
    await createProfileForUser({
      userId: user._id,
      username: user.username,
      picture: user.picture,
      bio: user.bio,
    });
    createdCount += 1;
  }

  console.log(`Created ${createdCount} missing writer profiles`);
};

run()
  .catch(() => {
    console.error('Profile backfill failed');
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
