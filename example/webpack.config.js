const createExpoWebpackConfigAsync = require('@expo/webpack-config');

module.exports = async function (env, argv) {
    const config = await createExpoWebpackConfigAsync(env, argv);

    // Add the react-native-onyx package to the webpack config so it can be resolved
    config.resolve.alias['react-native-onyx'] = `${__dirname}/..`;

    return config;
};
