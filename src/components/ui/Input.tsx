import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

export const Input = forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        'w-full rounded-xl border-4 border-black bg-white px-4 py-3 font-display text-lg',
        'focus:outline-none focus:ring-0 focus:border-crayon-blue',
        'placeholder:text-black/40',
        className,
      )}
      {...props}
    />
  ),
);
Input.displayName = 'Input';
