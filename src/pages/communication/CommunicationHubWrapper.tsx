import { useEffect } from 'react';
import CommunicationHub from './CommunicationHub';

export default function CommunicationHubWrapper() {
  // Add a spacer div to the body when this component mounts
  // and remove it when it unmounts
  useEffect(() => {
    // Create a spacer div
    const spacerDiv = document.createElement('div');
    spacerDiv.id = 'communication-hub-spacer';
    spacerDiv.style.height = 'calc(100vh - 64px)';
    
    // Add it to the body
    document.body.appendChild(spacerDiv);
    
    // Remove it when the component unmounts
    return () => {
      const spacer = document.getElementById('communication-hub-spacer');
      if (spacer) {
        document.body.removeChild(spacer);
      }
    };
  }, []);
  
  return <CommunicationHub />;
}
