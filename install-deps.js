// Script to install the missing Google Maps package
import { execSync } from 'child_process';

try {
  console.log('Installing @vis.gl/react-google-maps...');
  execSync('npm install @vis.gl/react-google-maps@1.5.2 --save', { stdio: 'inherit' });
  console.log('Installation complete!');
} catch (error) {
  console.error('Error installing package:', error.message);
  process.exit(1);
}
