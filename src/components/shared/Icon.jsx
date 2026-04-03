import React from 'react';
import * as LucideIcons from 'lucide-react';

const Icon = ({ name, ...props }) => {
  // Ensure we have a valid name and it exists in the library
  if (name && typeof name === 'string' && Object.prototype.hasOwnProperty.call(LucideIcons, name)) {
    const LucideIcon = LucideIcons[name];
    return <LucideIcon {...props} />;
  }

  // Fallback to a default Star icon if the requested icon is not found
  const FallbackIcon = LucideIcons.Star;
  return <FallbackIcon {...props} />;
};

export default Icon;