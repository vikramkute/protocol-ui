const esbuild = require("esbuild");
const { copy } = require("esbuild-plugin-copy");

const production = process.argv.includes('--production');
const watch = process.argv.includes('--watch');

/**
 * @type {import('esbuild').Plugin}
 */
const esbuildProblemMatcherPlugin = {
	name: 'esbuild-problem-matcher',

	setup(build) {
		build.onStart(() => {
			console.log('[watch] build started');
		});
		build.onEnd((result) => {
			result.errors.forEach(({ text, location }) => {
				console.error(`✘ [ERROR] ${text}`);
				console.error(`    ${location.file}:${location.line}:${location.column}:`);
			});
			console.log('[watch] build finished');
		});
	},
};

async function main() {
	const ctx = await esbuild.context({
		entryPoints: [
			'src/extension.ts'
		],
		bundle: true,
		format: 'cjs',
		minify: production,
		sourcemap: !production,
		sourcesContent: false,
		platform: 'node',
		outfile: 'dist/extension.js',
		external: ['vscode'],
		logLevel: 'silent',
		plugins: [
			/* add to the end of plugins array */
			esbuildProblemMatcherPlugin
		],
	});

	const ctxWebview = await esbuild.context({
		entryPoints: [
			'src/webview/main.ts'
		],
		bundle: true,
		format: 'cjs',
		minify: production,
		sourcemap: !production,
		sourcesContent: false,
		platform: 'node',
		outfile: 'dist/webview.js',
		external: ['vscode'],
		logLevel: 'silent',
		plugins: [
			// Copy webview css files to `dist` directory unaltered
			copy({
				resolveFrom: "cwd",
				assets: {
					from: ["./src/webview/*.css"],
					to: ["./dist"],
				},
			}),
			/* add to the end of plugins array */
			esbuildProblemMatcherPlugin
		],
	});
	if (watch) {
		await ctx.watch();
		await ctxWebview.watch();
	} else {
		await ctx.rebuild();
		await ctx.dispose();
		await ctxWebview.rebuild();
		await ctxWebview.dispose();
	}
}

main().catch(e => {
	console.error(e);
	process.exit(1);
});
