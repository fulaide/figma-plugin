const StyleDictionary = require('style-dictionary');
const config = require('./config.js');

// Build all platforms defined in the config
StyleDictionary.extend(config).buildAllPlatforms();

console.log('✅ Theme variables have been generated!');