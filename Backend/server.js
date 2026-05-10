const app = require('./src/app.js')
const config = require('./config/config.js')

// Start server
app.listen(config.PORT, () => {
  console.log(`Listening on port ${config.PORT}`);
});
