import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '../..');
const tarPath = path.join(__dirname, 'project.tar.gz');

console.log('Packaging project...');
console.log('Root directory:', rootDir);
console.log('Output tarball:', tarPath);

const excludes = [
  'node_modules',
  '.next',
  '.git',
  '.github',
  'local.db',
  'scratch',
  '*.log',
  '.claude',
  '.gemini',
  'tsconfig.tsbuildinfo',
  'tuyen sinh ds',
  'anh 2',
  '*.docx',
  '*.xlsx',
  '*.csv'
];

const excludeArgs = excludes.map(item => `--exclude="${item}"`).join(' ');
// Use relative path for output and input to avoid Unicode path encoding issue in Windows shell
const cmd = `tar -czf "scratch/deploy/project.tar.gz" ${excludeArgs} .`;

console.log(`Running: ${cmd}`);
try {
  execSync(cmd, { cwd: rootDir, stdio: 'inherit' });
  console.log('Packaging successful!');
} catch (error) {
  console.error('Packaging failed:', error);
  process.exit(1);
}
