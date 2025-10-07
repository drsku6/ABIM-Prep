import React from 'react';

export const VignetteIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 7.5V6.108c0-1.135.845-2.098 1.976-2.192.373-.03.748-.03 1.125 0 1.131.094 1.976 1.057 1.976 2.192V7.5M8.25 7.5h7.5M8.25 7.5V16.5a1.5 1.5 0 001.5 1.5h5.25a1.5 1.5 0 001.5-1.5V7.5m-7.5 0h-1.5A2.25 2.25 0 005.25 9.75v7.5A2.25 2.25 0 007.5 19.5h9a2.25 2.25 0 002.25-2.25v-7.5A2.25 2.25 0 0016.5 7.5h-1.5" />
    </svg>
);
