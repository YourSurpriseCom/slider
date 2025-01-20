import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import external from 'rollup-plugin-peer-deps-external';
import styles from 'rollup-plugin-styler';

const packageJson = require('./package.json');

export default {
    input: 'src/index.ts',
    output: [
        {
            file: packageJson.module,
            format: 'es',
            sourcemap: true,
        },
        {
            file: packageJson.main,
            format: 'cjs',
            sourcemap: true,
        },
    ],
    plugins: [
        external(),
        resolve(),
        commonjs(),
        typescript({
            tsconfig: './tsconfig.json',
        }),
        styles({
            mode: ['extract', 'index.css'],
            sourceMap: true,
        }),
    ],
};

