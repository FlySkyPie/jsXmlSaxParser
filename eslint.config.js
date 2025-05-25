// eslint.config.js
import { defineConfig } from "eslint/config";

export default defineConfig([
    {
        rules: {
            'no-var': 'warn',
            'prefer-arrow-callback': 'warn',
            'no-undef': 'warn',
            'no-unused-vars': 'warn',
            'no-invalid-this': 'warn',
            // semi: "error",
            // "prefer-const": "error",
        },
        "ignores": ["public/**/*"],
    },
]);
