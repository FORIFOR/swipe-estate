const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName.startsWith('node:') || ['http', 'https', 'url', 'events', 'stream', 'crypto', 'zlib', 'net', 'tls', 'fs', 'path'].includes(moduleName)) {
    return {
      type: 'empty',
    };
  }
  
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
