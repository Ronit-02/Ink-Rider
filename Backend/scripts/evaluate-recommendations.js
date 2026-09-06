const assert = require('node:assert/strict');
const fixtures = require('../data/recommendation-fixtures');
const { evaluateRecommendationFixtures } = require('../services/recommendation.service');

const results = evaluateRecommendationFixtures(fixtures);
const average = key => results.reduce((sum, result) => sum + result.metrics[key], 0) / results.length;

assert.ok(average('precisionAtLimit') >= 0.5, 'offline precision is below the 0.5 threshold');
assert.ok(average('authorDiversity') >= 0.75, 'offline author diversity is below the 0.75 threshold');
assert.ok(results.every(result => result.metrics.maxConsecutiveAuthor <= 2), 'a fixture repeats an author more than twice consecutively');

console.log(JSON.stringify({
  fixtureCount: results.length,
  averagePrecisionAtLimit: Number(average('precisionAtLimit').toFixed(4)),
  averageAuthorDiversity: Number(average('authorDiversity').toFixed(4)),
  averageTopicDiversity: Number(average('topicDiversity').toFixed(4)),
  results,
}, null, 2));
