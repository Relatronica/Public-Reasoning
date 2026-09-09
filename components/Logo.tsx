export default function Logo({ className = 'w-8 h-8' }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 32 32"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <path
        fill="currentColor"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M16 2.5 27.5 9.25v13.5L16 29.5 4.5 22.75v-13.5L16 2.5ZM16 20a4 4 0 1 1 0-8 4 4 0 0 1 0 8Z"
      />
    </svg>
  );
}
