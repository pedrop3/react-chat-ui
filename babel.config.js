module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    // O alias `@/*` é resolvido pelo Metro a partir do tsconfig.json
    // (suporte nativo a paths no Expo SDK 50+).
    plugins: ['react-native-reanimated/plugin'],
  };
};
