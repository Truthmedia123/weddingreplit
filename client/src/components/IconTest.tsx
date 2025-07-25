import * as AllLucideIcons from 'lucide-react';

export default function IconTest() {
  const PartyPopperDynamic = (AllLucideIcons as any).PartyPopper;
  const CameraDynamic = AllLucideIcons.Camera;
  
  console.log('IconTest - PartyPopper dynamic:', PartyPopperDynamic, 'Type:', typeof PartyPopperDynamic);
  console.log('IconTest - Camera dynamic:', CameraDynamic, 'Type:', typeof CameraDynamic);
  
  return (
    <div className="p-4 border border-red-500">
      <h3>Icon Test Component</h3>
      <div className="bg-blue-500 w-16 h-16 flex items-center justify-center">
        {PartyPopperDynamic ? 
          <PartyPopperDynamic className="text-white w-8 h-8" /> : 
          <CameraDynamic className="text-white w-8 h-8" />
        }
      </div>
      <p>PartyPopper (or Camera fallback) should appear above as white icon on blue background</p>
    </div>
  );
}