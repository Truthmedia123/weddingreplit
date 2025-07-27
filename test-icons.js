// Test which Lucide React icons actually exist
import * as LucideIcons from 'lucide-react';

const iconsToTest = [
  'Baby', 'Building', 'Cake', 'Calendar', 'Camera', 'Car', 'ChefHat', 
  'Coffee', 'Dog', 'FileText', 'Flower2', 'Gem', 'Gift', 'Globe', 
  'Heart', 'Home', 'Leaf', 'Mail', 'Mic', 'Music', 'Music2', 
  'Paintbrush', 'PartyPopper', 'Plane', 'Recycle', 'Shield', 
  'ShieldCheck', 'Shirt', 'Smartphone', 'Sparkles', 'Star', 
  'Truck', 'Users', 'Video', 'Volume2', 'Wine', 'Zap'
];

console.log('Testing Lucide React icons:');
iconsToTest.forEach(iconName => {
  const exists = iconName in LucideIcons;
  const component = LucideIcons[iconName];
  console.log(`${iconName}: ${exists ? '✓' : '✗'} ${typeof component}`);
});

console.log('\nAll available Lucide icons starting with these letters:');
const availableIcons = Object.keys(LucideIcons).filter(name => 
  ['B', 'C', 'D', 'F', 'G', 'H', 'L', 'M', 'P', 'S', 'T', 'U', 'V', 'W', 'Z'].includes(name[0])
);
console.log(availableIcons.slice(0, 50));