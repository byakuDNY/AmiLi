import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem, Type } from '@/types';
import { Head, router } from '@inertiajs/react';
import { Plus, Trash2, X } from 'lucide-react';
import { FormEvent, KeyboardEvent, useEffect, useState } from 'react';
import { toast } from 'sonner';

interface Props {
    types: Type[];
}

const SKIP_CONFIRMATION_KEY = 'types-skip-confirmation';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Types',
        href: '/types',
    },
];

export default function TypesPage({ types }: Props) {
    const [typeInput, setTypeInput] = useState('');
    const [pendingTypes, setPendingTypes] = useState<string[]>([]);
    const [skipConfirmation, setSkipConfirmation] = useState(() => {
        if (typeof window === 'undefined') return false;
        return localStorage.getItem(SKIP_CONFIRMATION_KEY) === 'true';
    });

    useEffect(() => {
        localStorage.setItem(SKIP_CONFIRMATION_KEY, skipConfirmation.toString());
    }, [skipConfirmation]);

    const handleAddType = (type: string) => {
        const trimmedType = type.trim().toLowerCase();
        if (!trimmedType) return;

        if (trimmedType.length > 30) {
            toast.error('Type name cannot be longer than 30 characters');
            return;
        }

        if (pendingTypes.includes(trimmedType)) {
            toast.error('Type already exists in the list');
            return;
        }

        setPendingTypes([...pendingTypes, trimmedType]);
        setTypeInput('');
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleAddType(typeInput);
        } else if (e.key === 'Backspace' && !typeInput) {
            setPendingTypes(pendingTypes.slice(0, -1));
        }
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();

        router.post(
            '/types',
            {
                types: pendingTypes,
            },
            {
                onSuccess: () => {
                    setPendingTypes([]);
                    toast.success('Types created successfully');
                },
                onError: (errors: { 'types.0'?: string; types?: string }) => {
                    toast.error(errors['types.0'] || errors.types || 'An unexpected error occurred');
                },
            },
        );
    };

    const deleteType = (typeId: number) => {
        if (!skipConfirmation && !confirm('Are you sure you want to delete this type?')) {
            return;
        }

        router.delete(`/types/${typeId}`, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Type deleted successfully');
            },
            onError: (error) => {
                toast.error(error?.message || 'Error deleting type');
            },
        });
    };

    return (
        <>
            <Head title="Types" />

            <AppLayout breadcrumbs={breadcrumbs}>
                <div className="container mx-auto space-y-4 p-4">
                    <div className="mx-4 mt-2 mb-8 flex justify-between">
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">Manage your types</h1>
                            <p className="text-muted-foreground mt-2 text-sm">Type and press Enter to add multiple types.</p>
                            <p className="text-muted-foreground mt-2 text-sm">Press Backspace to remove a type.</p>
                        </div>

                        <div className="mt-4 flex items-center space-x-2">
                            <Switch
                                className="text-red-600"
                                id="skip-confirmation"
                                checked={skipConfirmation}
                                onCheckedChange={setSkipConfirmation}
                            />
                            <label htmlFor="skip-confirmation" className="text-muted-foreground cursor-pointer text-sm">
                                Skip delete confirmation
                            </label>
                        </div>
                    </div>

                    <div className="bg-card mx-4 rounded-lg border p-6 shadow-sm">
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-4">
                                <div className="flex flex-wrap gap-2">
                                    {pendingTypes.map((type, index) => (
                                        <Badge key={index} variant="secondary" className="bg-primary/20 text-primary hover:bg-primary/30">
                                            {type}
                                            <button
                                                type="button"
                                                onClick={() => setPendingTypes(pendingTypes.filter((_, i) => i !== index))}
                                                className="hover:text-destructive ml-1"
                                            >
                                                <X className="h-3 w-3" />
                                            </button>
                                        </Badge>
                                    ))}
                                </div>
                                <div className="flex space-x-2">
                                    <Input
                                        value={typeInput}
                                        onChange={(e) => setTypeInput(e.target.value)}
                                        onKeyDown={handleKeyDown}
                                        placeholder="Type names (e.g., manga, anime)..."
                                        className="flex-1"
                                    />
                                    <Button type="submit" disabled={pendingTypes.length === 0}>
                                        <Plus className="mr-2 h-4 w-4" />
                                        Save Types
                                    </Button>
                                </div>
                            </div>
                        </form>

                        <div className="mt-8">
                            <h2 className="mb-4 text-lg font-semibold">Existing Types</h2>
                            <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                {types.map((type) => (
                                    <div key={type.id} className="flex items-center justify-between rounded-lg border p-3">
                                        <span className="truncate">{type.name}</span>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => deleteType(type.id)}
                                            className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </AppLayout>
        </>
    );
}
