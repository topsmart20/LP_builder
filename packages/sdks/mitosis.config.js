const seedrandom = require('seedrandom');
const rng = seedrandom('vue-sdk-seed');

const getSeededId = () => {
  const rngVal = rng();
  return Number(String(rngVal).split('.')[1]).toString(36);
};

/**
 * @type {import('@builder.io/mitosis'.MitosisConfig)}
 */
module.exports = {
  files: 'src/**',
  targets: ['reactNative', 'vue', 'solid'],
  transpiler: {
    vue: { format: 'esm' },
    solid: { format: 'esm' },
    reactNative: { format: 'esm' },
  },
  options: {
    vue: {
      registerComponentPrepend:
        "import { registerComponent } from '../functions/register-component'",
      cssNamespace: getSeededId,
    },
  },
};
