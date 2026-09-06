const mongoose = require('mongoose');
const { connectToMongoDB } = require('../utils/mongoConnect');
const Question = require('../schemas/question.schema');

const run = async () => {
  await connectToMongoDB();

  const result = await Question.updateMany(
    {},
    [
      {
        $set: {
          upvotesCount: { $size: { $ifNull: ['$upvotes', []] } },
        },
      },
    ]
  );

  console.log(`Updated ${result.modifiedCount} question records`);
};

run()
  .catch(error => {
    console.error('Question upvote backfill failed');
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
