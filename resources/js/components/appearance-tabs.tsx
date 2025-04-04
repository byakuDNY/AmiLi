import { Appearance, useAppearance } from '@/hooks/use-appearance';
import { cn } from '@/lib/utils';
import { LucideIcon, Monitor, Moon, Sun } from 'lucide-react';
import { HTMLAttributes } from 'react';

export default function AppearanceToggleTab({ className = '', ...props }: HTMLAttributes<HTMLDivElement>) {
    const { appearance, updateAppearance } = useAppearance();

    const tabs: { value: Appearance; icon: LucideIcon; label: string; primaryColor: string }[] = [
        { value: 'light', icon: Sun, label: 'Light', primaryColor: 'oklch(0.205 0 0)' },
        { value: 'dark', icon: Moon, label: 'Dark', primaryColor: 'oklch(0.985 0 0)' },
        { value: 'system', icon: Monitor, label: 'System', primaryColor: 'oklch(0.205 0 0)' },
        { value: 'light-green', icon: Sun, label: 'Light Green', primaryColor: 'oklch(0.45 0.18 145)' },
        { value: 'dark-green', icon: Moon, label: 'Dark Green', primaryColor: 'oklch(0.6 0.2 145)' },
        { value: 'light-blue', icon: Sun, label: 'Light Blue', primaryColor: 'oklch(0.45 0.18 240)' },
        { value: 'dark-blue', icon: Moon, label: 'Dark Blue', primaryColor: 'oklch(0.6 0.2 240)' },
        { value: 'light-red', icon: Sun, label: 'Light Red', primaryColor: 'oklch(0.55 0.22 25)' },
        { value: 'dark-red', icon: Moon, label: 'Dark Red', primaryColor: 'oklch(0.6 0.25 25)' },
        { value: 'light-yellow', icon: Sun, label: 'Light Yellow', primaryColor: 'oklch(0.8 0.18 90)' },
        { value: 'dark-yellow', icon: Moon, label: 'Dark Yellow', primaryColor: 'oklch(0.75 0.2 90)' },
    ];

    return (
        <div className={cn('space-y-1', className)} {...props}>
            {/* First row - 3 buttons */}
            <div className="bg-muted grid grid-cols-3 gap-1 rounded-lg p-1">
                {tabs.slice(0, 3).map(({ value, icon: Icon, label }) => (
                    <button
                        key={value}
                        onClick={() => updateAppearance(value)}
                        className={cn(
                            'flex items-center rounded-md px-3.5 py-1.5 transition-colors',
                            appearance === value
                                ? 'bg-background text-foreground shadow-sm'
                                : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                        )}
                    >
                        <Icon className="-ml-1 h-4 w-4" />
                        <span className="ml-1.5 text-sm">{label}</span>
                    </button>
                ))}
            </div>

            {/* Second row - 2 buttons */}
            <div className="bg-muted grid grid-cols-2 gap-1 rounded-lg p-1">
                {tabs.slice(3).map(({ value, icon: Icon, label }) => (
                    <button
                        key={value}
                        onClick={() => updateAppearance(value)}
                        className={cn(
                            'flex items-center rounded-md px-3.5 py-1.5 transition-colors',
                            appearance === value
                                ? 'bg-background text-foreground shadow-sm'
                                : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                        )}
                    >
                        <Icon className="-ml-1 h-4 w-4" />
                        <span className="ml-1.5 text-sm">{label}</span>
                    </button>
                ))}
            </div>
        </div>
    );
}
