// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ['dist/*'],
  },
  {
    rules: {
      // 🛡️ PERFORMANCE GUARDRAIL: Prevent bare useBloodworkStore() usage
      // This rule catches performance regressions where developers accidentally
      // subscribe to the entire store instead of using selective subscriptions
      'no-restricted-syntax': [
        'error',
        {
          selector: "CallExpression[callee.name='useBloodworkStore'][arguments.length=0]",
          message: '🚨 Performance Risk: Use selective subscriptions instead of bare useBloodworkStore(). Example: useBloodworkStore(s => s.step) or useUploadFlow()'
        },
        {
          selector: "VariableDeclarator[id.type='ObjectPattern'] > CallExpression[callee.name='useBloodworkStore'][arguments.length=0]",
          message: '🚨 Performance Risk: Destructuring entire store causes render storms. Use selective subscriptions: useBloodworkStore(s => s.step) or custom hooks like useUploadFlow()'
        }
      ]
    }
  }
]);
