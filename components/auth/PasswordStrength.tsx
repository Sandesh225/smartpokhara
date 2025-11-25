'use client';

/**
 * Password strength indicator component
 */

export function PasswordStrength({ password }: { password: string }) {
  const getStrength = () => {
    if (!password) return { level: 0, label: '', color: '' };

    let strength = 0;
    
    // Length check
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    
    // Contains lowercase
    if (/[a-z]/.test(password)) strength++;
    
    // Contains uppercase
    if (/[A-Z]/.test(password)) strength++;
    
    // Contains number
    if (/[0-9]/.test(password)) strength++;
    
    // Contains special character
    if (/[^A-Za-z0-9]/.test(password)) strength++;

    if (strength <= 2) return { level: 1, label: 'Weak', color: 'bg-red-500' };
    if (strength <= 4) return { level: 2, label: 'Fair', color: 'bg-yellow-500' };
    if (strength <= 5) return { level: 3, label: 'Good', color: 'bg-blue-500' };
    return { level: 4, label: 'Strong', color: 'bg-green-500' };
  };

  const strength = getStrength();

  if (!password) return null;

  return (
    <div className="space-y-2">
      <div className="flex gap-1">
        {[1, 2, 3, 4].map((level) => (
          <div
            key={level}
            className={`h-2 flex-1 rounded-full transition-colors ${
              level <= strength.level ? strength.color : 'bg-gray-200'
            }`}
          />
        ))}
      </div>
      {strength.label && (
        <p className="text-xs text-gray-600">
          Password strength: <span className="font-medium">{strength.label}</span>
        </p>
      )}
      <ul className="text-xs text-gray-500 space-y-1">
        <li className={password.length >= 8 ? 'text-green-600' : ''}>
          ✓ At least 8 characters
        </li>
        <li className={/[A-Z]/.test(password) ? 'text-green-600' : ''}>
          ✓ Contains uppercase letter
        </li>
        <li className={/[a-z]/.test(password) ? 'text-green-600' : ''}>
          ✓ Contains lowercase letter
        </li>
        <li className={/[0-9]/.test(password) ? 'text-green-600' : ''}>
          ✓ Contains number
        </li>
      </ul>
    </div>
  );
}