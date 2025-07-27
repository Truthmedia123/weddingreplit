import React from 'react';
import { Camera, Music, Wine, Baby, Building } from 'lucide-react';

// Test component to verify icons work
export function TestIcons() {
  return (
    <div style={{ display: 'flex', gap: '20px', padding: '20px' }}>
      <div>
        <Camera size={32} />
        <p>Camera</p>
      </div>
      <div>
        <Music size={32} />
        <p>Music</p>
      </div>
      <div>
        <Wine size={32} />
        <p>Wine</p>
      </div>
      <div>
        <Baby size={32} />
        <p>Baby</p>
      </div>
      <div>
        <Building size={32} />
        <p>Building</p>
      </div>
    </div>
  );
}