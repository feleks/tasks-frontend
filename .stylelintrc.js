const { propertyOrdering, selectorOrdering } = require('stylelint-semantic-groups');

module.exports = {
    ignoreFiles: ['dist/**/*', 'public/**/*'],
    extends: ['stylelint-config-recommended-scss', 'stylelint-config-prettier-scss'],
    plugins: ['stylelint-scss', 'stylelint-order'],
    rules: {
        'rule-empty-line-before': ['always', { except: ['first-nested', 'after-single-line-comment'] }],
        'no-descending-specificity': null,
        'block-no-empty': null,
        'comment-empty-line-before': 'always',
        'property-no-vendor-prefix': true,
        'value-no-vendor-prefix': true,
        'selector-no-vendor-prefix': true,
        'at-rule-no-vendor-prefix': true,
        'declaration-block-single-line-max-declarations': 0,
        'selector-type-case': 'lower',
        'function-whitespace-after': 'always',
        'function-url-quotes': 'always',
        'color-hex-length': 'long',

        'order/order': selectorOrdering,
        'order/properties-order': propertyOrdering,
        'scss/no-global-function-names': null,
    }
};
