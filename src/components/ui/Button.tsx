import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

type Variant = 'primary' | 'secondary' | 'ghost';
type Size = 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

const variants: Record<Variant, string> = {
  primary:
    'bg-crayon-red text-white border-4 border-black shadow-[4px_4px_0_0_#000] hover:-translate-y-0.5 active:translate-y-0 active:shadow-[2px_2px_0_0_#000]',
  secondary:
    'bg-crayon-yellow text-black border-4 border-black shadow-[4px_4px_0_0_#000] hover:-translate-y-0.5 active:translate-y-0 active:shadow-[2px_2px_0_0_#000]',
  ghost:
    'bg-transparent text-black border-2 border-transparent hover:bg-black/5',
};

const sizes: Record<Size, string> = {
  md: 'px-5 py-2.5 text-base rounded-xl',
  lg: 'px-7 py-4 text-xl rounded-2xl',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        'font-display font-semibold transition-transform select-none disabled:opacity-50 disabled:cursor-not-allowed',
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    />
  ),
);
Button.displayName = 'Button';
