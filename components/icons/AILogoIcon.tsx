import React from 'react';

export const AILogoIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    aria-hidden="true"
  >
    <path
      fillRule="evenodd"
      d="M9.315 7.584C12.195 3.883 16.695 1.5 21.75 1.5a.75.75 0 01.75.75c0 5.056-2.383 9.555-6.084 12.436A6.75 6.75 0 019.75 22.5a.75.75 0 01-.75-.75v-7.19c0-1.754.665-3.435 1.815-4.636zM15 15.666a5.25 5.25 0 00-3.484-4.888 1.5 1.5 0 00-2.032 2.032A5.25 5.25 0 0015 15.666zM4.5 5.25a3.75 3.75 0 00-3.75 3.75v6a3.75 3.75 0 003.75 3.75h6a3.75 3.75 0 003.75-3.75v-6a3.75 3.75 0 00-3.75-3.75h-6z"
      clipRule="evenodd"
    />
  </svg>
);
