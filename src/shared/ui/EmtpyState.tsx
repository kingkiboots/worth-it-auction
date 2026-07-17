import Link from "next/link";
import { ReactNode } from "react";

interface Props {
  icon?: string | ReactNode;
  title: string;
  description: ReactNode;
  actionHref?: string;
  actionText?: string;
}

export function EmptyState({
  icon = "🤔",
  title,
  description,
  actionHref,
  actionText,
}: Props) {
  return (
    <div className="flex flex-col items-center justify-center w-full py-24 px-6 text-center animate-in fade-in duration-500">
      <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6 shadow-inner">
        <span className="text-4xl">{icon}</span>
      </div>
      <h3 className="text-xl font-extrabold text-gray-900 mb-2 break-keep">
        {title}
      </h3>
      <p className="text-sm font-medium text-gray-500 mb-8 max-w-[250px] leading-relaxed break-keep">
        {description}
      </p>

      {actionHref && actionText && (
        <Link href={actionHref} passHref>
          <button className="px-8 py-4 bg-[#171717] text-white text-sm font-bold rounded-2xl hover:bg-gray-800 active:scale-95 transition-all flex items-center gap-2">
            {actionText}
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </Link>
      )}
    </div>
  );
}
