const {task, series} = require('gulp');
const {spawnSync} = require('child_process');
const fs = require('fs');
const path = require('path');

const DAWN_ROOT = path.resolve('./dawn/');
const DEPOT_TOOLS_ROOT = path.join(DAWN_ROOT, 'depot_tools');

const PROJ_ROOT = 'out/shared';

if(process.platform == 'win32') throw new Error('Windows user should run this on WSL.');

function buildDawn(cb){
	const new_path = `${process.env.PATH}:${path.resolve(DEPOT_TOOLS_ROOT)}`;
	console.log('Virtual PATH: ' + new_path);

	if(!fs.existsSync(DAWN_ROOT)){
		console.log('> Cloning Dawn...');
		spawnSync('git', ['clone', 'https://dawn.googlesource.com/dawn', DAWN_ROOT], {stdio: 'inherit'});
		// Download depot_tools
		spawnSync('git', ['clone', 'https://chromium.googlesource.com/chromium/tools/depot_tools.git', DEPOT_TOOLS_ROOT], {stdio: 'inherit'});
		process.chdir(DAWN_ROOT);
		spawnSync('cp', ['scripts/standalone.gclient', '.gclient'], {stdio: 'inherit'});
		console.log('> Fetching dependencies and tools, this should take a while...');
		spawnSync('gclient', ['sync'],{stdio: 'inherit', env:{PATH: new_path}});
		cb();
	}

	console.log('> Building Dawn...');
	process.chdir(DAWN_ROOT);	
	// Compile Dawn
	console.log('> It takes some time to compile, you should consider ["walk your dog", "take a dump", "watch YT videos"].')
	spawnSync('gn', ['gen', PROJ_ROOT, 
		'--target_cpu="x86" --args="is_component_build=true is_debug=false is_clang=true'
	], {stdio: 'inherit', env:{PATH: new_path}});
	spawnSync('ninja', ['-C', PROJ_ROOT], {stdio: 'inherit', env:{PATH: new_path}});
	cb();
}

task('build-dawn', series(buildDawn));


