import { defineConfig } from 'rollup';

import jsonPlugin from '@rollup/plugin-json';
import commonjsPlugin from '@rollup/plugin-commonjs';
import nodeResolvePlugin from '@rollup/plugin-node-resolve';
import typescriptPlugin from 'rollup-plugin-typescript2';

import { tmpdir } from 'os';
import { join as pathJoin } from 'path';

import pkg from './package.json';

const cacheRoot = pathJoin(tmpdir(), '.rpt2_cache');

const src = pathJoin(__dirname, 'src');
const dist = pathJoin(__dirname, 'dist');

// eslint-disable-next-line import/no-default-export
export default defineConfig({
	input: pathJoin(src, 'index.ts'),
	external: process.env.NODE_ENV !== 'production'
		? Object.keys(pkg.dependencies)
		: [],
	plugins: [
		nodeResolvePlugin({}),
		commonjsPlugin({
			include: 'node_modules/**'
		}),
		jsonPlugin({
			preferConst: true
		}),
		typescriptPlugin({
			cacheRoot,

			useTsconfigDeclarationDir: false,

			tsconfigOverride: {
				outDir: dist,
				rootDir: src,
				include: [src]
			}
		})
	],
	output: [
		{
			file: pathJoin(dist, 'cleaner.js'),
			format: 'cjs',
			exports: 'named',
			banner: '#!/usr/bin/env node',
			inlineDynamicImports: true
		}
	]
});
