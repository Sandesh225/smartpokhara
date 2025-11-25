'use client';

import Link from 'next/link';

interface DashboardCardProps {
  title: string;
  description: string;
  icon: string;
  href: string;
  badge?: string;
}

export function DashboardCard({
  title,
  description,
  icon,
  href,
  badge,
}: DashboardCardProps) {
  return (
    <Link
      href={href}
      className="
        block bg-white rounded-lg shadow 
        hover:shadow-md transition-shadow p-6 group
      "
    >
      <div className="flex items-start justify-between">
        <div className="text-4xl mb-3">{icon}</div>

        {badge && (
          <span
            className="
              px-2 py-1 bg-red-100 text-red-800 
              rounded-full text-xs font-medium
            "
          >
            {badge}
          </span>
        )}
      </div>

      <h3
        className="
          text-lg font-semibold text-gray-900 
          group-hover:text-blue-600 transition-colors
        "
      >
        {title}
      </h3>

      <p className="mt-1 text-sm text-gray-600">{description}</p>
    </Link>
  );
}
