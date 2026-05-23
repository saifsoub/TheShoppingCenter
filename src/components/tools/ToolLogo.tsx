interface Props {
  toolId: string;
  className?: string;
}

export default function ToolLogo({ toolId, className = 'w-7 h-7' }: Props) {
  switch (toolId) {
    case 'monday':
      return (
        <svg className={className} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="monday.com">
          <rect width="40" height="40" rx="10" fill="#F62B54" />
          <ellipse cx="10" cy="27" rx="5" ry="5" fill="#FF5AC4" />
          <ellipse cx="20" cy="27" rx="5" ry="5" fill="#FFCB00" />
          <ellipse cx="30" cy="27" rx="5" ry="5" fill="#00CA72" />
        </svg>
      );
    case 'gmail':
      return (
        <svg className={className} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Gmail">
          <rect width="40" height="40" rx="10" fill="#fff" />
          <path d="M6 28V14l14 9 14-9v14a2 2 0 01-2 2H8a2 2 0 01-2-2z" fill="#EA4335" />
          <path d="M6 14h28L20 23 6 14z" fill="#4285F4" />
          <path d="M6 28V14l6 4v12H8a2 2 0 01-2-2z" fill="#34A853" />
          <path d="M34 28V14l-6 4v12h4a2 2 0 002-2z" fill="#FBBC04" />
          <path d="M6 14l6 4 8-5 8 5 6-4" fill="#EA4335" />
        </svg>
      );
    case 'gdrive':
      return (
        <svg className={className} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Google Drive">
          <rect width="40" height="40" rx="10" fill="#fff" />
          <path d="M15 28l-8-14h10l8 14H15z" fill="#4285F4" />
          <path d="M25 14h10l-8 14H17l8-14z" fill="#EA4335" />
          <path d="M7 28h26l-4-7H11l-4 7z" fill="#34A853" />
        </svg>
      );
    case 'gcal':
      return (
        <svg className={className} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Google Calendar">
          <rect width="40" height="40" rx="10" fill="#fff" />
          <rect x="6" y="10" width="28" height="24" rx="3" fill="#fff" stroke="#E0E0E0" strokeWidth="1.5" />
          <rect x="6" y="10" width="28" height="8" rx="3" fill="#1A73E8" />
          <rect x="6" y="15" width="28" height="3" fill="#1A73E8" />
          <circle cx="14" cy="8" r="2.5" fill="#DB4437" />
          <circle cx="26" cy="8" r="2.5" fill="#DB4437" />
          <rect x="13" y="8" width="2" height="6" rx="1" fill="#DB4437" />
          <rect x="25" y="8" width="2" height="6" rx="1" fill="#DB4437" />
          <text x="20" y="29" textAnchor="middle" fontSize="10" fontWeight="700" fill="#1A73E8">31</text>
        </svg>
      );
    case 'slack':
      return (
        <svg className={className} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Slack">
          <rect width="40" height="40" rx="10" fill="#4A154B" />
          <path d="M14 22a3 3 0 010-6h3v3a3 3 0 01-3 3z" fill="#E01E5A" />
          <path d="M14 22a3 3 0 000 6 3 3 0 003-3v-3h-3z" fill="#E01E5A" />
          <path d="M26 16a3 3 0 010 6h-3v-3a3 3 0 013-3z" fill="#2EB67D" />
          <path d="M26 16a3 3 0 000-6 3 3 0 00-3 3v3h3z" fill="#2EB67D" />
          <path d="M18 28a3 3 0 01-6 0 3 3 0 013-3h3v3z" fill="#ECB22E" />
          <path d="M18 28a3 3 0 006 0 3 3 0 00-3-3h-3v3z" fill="#ECB22E" />
          <path d="M22 12a3 3 0 01-6 0 3 3 0 013 3h3v-3z" fill="#36C5F0" />
          <path d="M22 12a3 3 0 00-6 0 3 3 0 003 3h3v-3z" fill="#36C5F0" />
        </svg>
      );
    case 'telegram':
      return (
        <svg className={className} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Telegram">
          <rect width="40" height="40" rx="10" fill="#26A5E4" />
          <path d="M8 19.5l22-9-4 20-7-6-4 4 1-8 12-10-14 7-6-2z" fill="#fff" />
          <path d="M16 26.5v-6.5l4 3.5-4 3z" fill="#C8DAEA" />
          <path d="M20 23.5l6 3-10 3 4-6z" fill="#A9C9DD" />
        </svg>
      );
    case 'notion':
      return (
        <svg className={className} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Notion">
          <rect width="40" height="40" rx="10" fill="#fff" />
          <path
            d="M10 9h13l8 8v15a2 2 0 01-2 2H10a2 2 0 01-2-2V11a2 2 0 012-2z"
            fill="#fff"
            stroke="#e0e0e0"
            strokeWidth="1.5"
          />
          <path d="M23 9v8h8" fill="none" stroke="#e0e0e0" strokeWidth="1.5" />
          <text x="20" y="27" textAnchor="middle" fontSize="13" fontWeight="900" fill="#1a1a1a" fontFamily="serif">N</text>
        </svg>
      );
    case 'github':
      return (
        <svg className={className} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="GitHub">
          <rect width="40" height="40" rx="10" fill="#24292F" />
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M20 8C13.373 8 8 13.373 8 20c0 5.302 3.438 9.8 8.207 11.387.6.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0120 12.796c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C28.566 29.797 32 25.3 32 20c0-6.627-5.373-12-12-12z"
            fill="#fff"
          />
        </svg>
      );
    case 'gsheets':
      return (
        <svg className={className} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Google Sheets">
          <rect width="40" height="40" rx="10" fill="#0F9D58" />
          <rect x="10" y="8" width="20" height="24" rx="2" fill="#fff" />
          <rect x="10" y="8" width="20" height="6" rx="2" fill="#0F9D58" />
          <rect x="10" y="11" width="20" height="3" fill="#0F9D58" />
          <line x1="10" y1="20" x2="30" y2="20" stroke="#E0E0E0" strokeWidth="1" />
          <line x1="10" y1="25" x2="30" y2="25" stroke="#E0E0E0" strokeWidth="1" />
          <line x1="19" y1="14" x2="19" y2="32" stroke="#E0E0E0" strokeWidth="1" />
          <rect x="11" y="15" width="7" height="4" fill="#E6F4EA" />
          <rect x="20" y="15" width="9" height="4" fill="#E6F4EA" />
        </svg>
      );
    default:
      return (
        <svg className={className} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="40" height="40" rx="10" fill="#374151" />
          <text x="20" y="26" textAnchor="middle" fontSize="16">🔧</text>
        </svg>
      );
  }
}
