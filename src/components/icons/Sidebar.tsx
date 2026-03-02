/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from "react";

function SidebarIcon(props: any) {
  return (
    <svg
      width={40}
      height={40}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M23 12v16m0-16h-7.8c-1.12 0-1.68 0-2.108.218a1.999 1.999 0 00-.874.874C12 13.52 12 14.08 12 15.2v9.6c0 1.12 0 1.68.218 2.107.192.377.498.683.874.875.427.218.987.218 2.105.218H23m0-16h1.8c1.12 0 1.68 0 2.107.218.377.192.683.498.875.874.218.427.218.987.218 2.105v9.606c0 1.118 0 1.677-.218 2.104a2.003 2.003 0 01-.875.875c-.427.218-.986.218-2.104.218H23"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default SidebarIcon;
