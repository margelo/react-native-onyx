module.exports = {
    presets: ['module:metro-react-native-babel-preset'],
    plugins: [
        'react-native-web',
        [
            'module-resolver',
            {
                alias: {
                    '^react-native$': 'react-native-web',
                },
            },
        ],
    ],
};
