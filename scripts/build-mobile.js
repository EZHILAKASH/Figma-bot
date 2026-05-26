const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const apiDir = path.join(__dirname, '..', 'src', 'app', 'api');
const tempApiDir = path.join(__dirname, '..', 'src', 'app_api_temp');

let renamed = false;

try {
  // 0. Clean .next cache folder to avoid type-check errors on stale files referencing relocated APIs
  const nextCacheDir = path.join(__dirname, '..', '.next');
  if (fs.existsSync(nextCacheDir)) {
    console.log('Cleaning stale .next compiler cache...');
    fs.rmSync(nextCacheDir, { recursive: true, force: true });
  }

  // 1. Rename api folder to temp if it exists
  if (fs.existsSync(apiDir)) {
    console.log('Temporarily renaming src/app/api to src/app_api_temp to allow static export...');
    fs.renameSync(apiDir, tempApiDir);
    renamed = true;
  } else {
    console.log('src/app/api folder not found, proceeding directly.');
  }

  // 2. Run next build with export env
  console.log('Running Next.js static export build...');
  execSync('npx.cmd next build', {
    env: { ...process.env, NEXT_PUBLIC_IS_MOBILE: 'true' },
    stdio: 'inherit'
  });

  console.log('Next.js build completed successfully.');

} catch (error) {
  console.error('Error during build-mobile:', error);
  process.exitCode = 1;
} finally {
  // 3. Rename back
  if (renamed && fs.existsSync(tempApiDir)) {
    console.log('Restoring src/app/api...');
    fs.renameSync(tempApiDir, apiDir);
  }
}
