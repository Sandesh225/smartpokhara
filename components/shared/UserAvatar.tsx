// components/shared/UserAvatar.tsx
interface UserAvatarProps {
  user: any;
  size?: 'sm' | 'md' | 'lg';
}

export function UserAvatar({ user, size = 'md' }: UserAvatarProps) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
  };

  const textSizes = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  const displayName = user.user_profiles?.full_name || user.email?.split('@')[0] || 'U';
  const initials = displayName
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div
      className={`${sizeClasses[size]} rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold ${textSizes[size]}`}
    >
      {initials}
    </div>
  );
}