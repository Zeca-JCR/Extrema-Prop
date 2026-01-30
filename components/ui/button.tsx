import { ButtonHTMLAttributes, forwardRef } from 'react';
import { twMerge } from 'tailwind-merge';
import clsx from 'clsx';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'accent' | 'outline' | 'ghost' | 'danger';
    size?: 'sm' | 'md' | 'lg';
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
        return (
            <button
                ref={ref}
                className={twMerge(
                    clsx(
                        'inline-flex items-center justify-center font-bold uppercase tracking-wider transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-brand-primary-500/50 disabled:opacity-50 disabled:cursor-not-allowed active:translate-y-[2px] active:shadow-none',
                        {
                            // Solid Sharp Borders
                            'border-2 border-black': true,

                            // Variants
                            'bg-brand-primary-500 text-white hover:bg-brand-primary-600 shadow-swiss hover:shadow-swiss-hover': variant === 'primary',
                            'bg-white text-black hover:bg-gray-50 shadow-swiss hover:shadow-swiss-hover': variant === 'secondary',
                            'bg-brand-accent-500 text-white hover:bg-brand-accent-600 shadow-swiss hover:shadow-swiss-hover': variant === 'accent',
                            'bg-transparent border-brand-primary-500 text-brand-primary-500 hover:bg-brand-primary-50': variant === 'outline',
                            'bg-transparent border-transparent text-gray-700 hover:bg-gray-100 shadow-none': variant === 'ghost',
                            'bg-red-600 text-white hover:bg-red-700 shadow-swiss hover:shadow-swiss-hover': variant === 'danger',

                            // Sizes
                            'text-xs px-3 py-1': size === 'sm',
                            'text-sm px-5 py-2': size === 'md',
                            'text-base px-6 py-3': size === 'lg',
                        },
                        className
                    )
                )}
                {...props}
            />
        );
    }
);

Button.displayName = 'Button';
