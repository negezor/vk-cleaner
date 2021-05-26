import jsonPlugin from '@rollup/plugin-json';
import commonjsPlugin from '@rollup/plugin-commonjs';
import nodeResolvePlugin from '@rollup/plugin-node-resolve';
import typescriptPlugin from 'rollup-plugin-typescript2';

import { tmpdir } from 'os';
import { join as pathJoin } from 'path';

import pkg from './package.json';

const cacheRoot = pathJoin(tmpdir(), '.rpt2_cache');

const src = pathJoin(__dirname, 'src');
const lib = pathJoin(__dirname, 'lib');

// eslint-disable-next-line import/no-default-export
export default {
	input: pathJoin(src, 'index.ts'),
	external: process.env.NODE_ENV !== 'production'
		? Object.keys(pkg.dependencies)
		: [],
	plugins: [
		commonjsPlugin({}),
		nodeResolvePlugin({}),
		jsonPlugin({}),
		typescriptPlugin({
			cacheRoot,

			useTsconfigDeclarationDir: false,

			tsconfigOverride: {
				outDir: lib,
				rootDir: src,
				include: [src]
			}
		})
	],
	output: [
		{
			file: `${pkg.main}.js`,
			format: 'cjs',
			exports: 'named'
		}
	]
};
