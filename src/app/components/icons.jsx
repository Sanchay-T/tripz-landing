export const Icons = {
  phone: (props) => (
    <svg
      width={props.size ?? 16}
      height={props.size ?? 16}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2A19.79 19.79 0 0 1 3.09 4.18 2 2 0 0 1 5.08 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L9.09 10.09a16 16 0 0 0 6 6l1.45-1.45a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  ),
  chat: (props) => (
    <svg
      width={props.size ?? 16}
      height={props.size ?? 16}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  ),
  whatsapp: (props) => (
    <svg
      width={props.size ?? 16}
      height={props.size ?? 16}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M19.07 4.93A10 10 0 0 0 4.42 18.5L3 22l3.6-1.37A10 10 0 1 0 19.07 4.93Zm-7 16.32a8.3 8.3 0 0 1-4.21-1.16l-.3-.18-2.13.81.81-2.07-.2-.31a8.3 8.3 0 1 1 6.03 2.91Zm4.6-6.18c-.25-.13-1.49-.74-1.72-.82-.23-.08-.4-.13-.57.13-.17.25-.66.82-.81.99-.15.16-.3.18-.55.06a6.78 6.78 0 0 1-3.4-2.97c-.26-.44.26-.4.74-1.34.08-.16.04-.3-.02-.43l-.78-1.88c-.21-.5-.42-.43-.57-.44h-.49a.94.94 0 0 0-.69.32 2.86 2.86 0 0 0-.9 2.13c0 1.26.92 2.47 1.05 2.64.13.17 1.81 2.77 4.39 3.88.61.27 1.09.43 1.46.55.61.2 1.17.17 1.61.1.49-.07 1.49-.61 1.71-1.2.21-.59.21-1.1.15-1.2-.06-.1-.23-.16-.48-.29Z" />
    </svg>
  ),
  arrow: (props) => (
    <svg
      width={props.size ?? 13}
      height={props.size ?? 13}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  )
};
