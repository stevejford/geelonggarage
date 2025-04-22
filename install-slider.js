// Script to install the missing Radix UI Slider package
import { execSync } from 'child_process';

try {
  console.log('Installing @radix-ui/react-slider...');
  execSync('npm install @radix-ui/react-slider --save', { stdio: 'inherit' });
  console.log('Installation complete!');
} catch (error) {
  console.error('Error installing package:', error.message);
  process.exit(1);
}
