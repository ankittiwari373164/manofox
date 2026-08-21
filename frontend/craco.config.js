const path = require("path");

module.exports = {
  webpack: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
    configure: (config) => {
      // Drop the TypeScript type-checker. This project is plain JS, and the
      // plugin pulls in an old schema-utils that crashes on ajv-keywords@5.
      config.plugins = config.plugins.filter(
        (p) => p.constructor.name !== "ForkTsCheckerWebpackPlugin"
      );
      return config;
    },
  },
};