import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem, Tag } from '@/types';
import { Head, router } from '@inertiajs/react';
import { Plus, Trash2, X } from 'lucide-react';
import { FormEvent, KeyboardEvent, useEffect, useState } from 'react';
import { toast } from 'sonner';

interface Props {
    tags: Tag[];
}
const SKIP_CONFIRMATION_KEY = 'tags-skip-confirmation';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Tags',
        href: '/tags',
    },
];

export default function TagsPage({ tags }: Props) {
    const [tagInput, setTagInput] = useState('');
    const [pendingTags, setPendingTags] = useState<string[]>([]);
    const [skipConfirmation, setSkipConfirmation] = useState(() => {
        if (typeof window === 'undefined') return false;
        return localStorage.getItem(SKIP_CONFIRMATION_KEY) === 'true';
    });

    useEffect(() => {
        localStorage.setItem(SKIP_CONFIRMATION_KEY, skipConfirmation.toString());
    }, [skipConfirmation]);

    const handleAddTag = (tag: string) => {
        const trimmedTag = tag.trim();
        if (!trimmedTag) return;

        if (trimmedTag.length > 30) {
            toast.error('Tag name cannot be longer than 30 characters');
            return;
        }

        if (pendingTags.includes(trimmedTag)) {
            toast.error('Tag already exists in the list');
            return;
        }

        setPendingTags([...pendingTags, tag]);
        setTagInput('');
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleAddTag(tagInput);
        } else if (e.key === ',' || e.key === ' ') {
            e.preventDefault();
            handleAddTag(tagInput);
        } else if (e.key === 'Backspace' && !tagInput) {
            setPendingTags(pendingTags.slice(0, -1));
        }
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();

        router.post(
            '/tags',
            {
                tags: pendingTags,
            },
            {
                onSuccess: () => {
                    setPendingTags([]);
                    toast.success('Tags created successfully');
                },
                onError: (errors: { 'tags.0'?: string; tags?: string }) => {
                    toast.error(errors['tags.0'] || errors.tags || 'An unexpected error occurred');
                },
            },
        );
    };

    const deleteTag = (tagId: number) => {
        if (!skipConfirmation && !confirm('Are you sure you want to delete this tag?')) {
            return;
        }

        router.delete(`/tags/${tagId}`, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Tag deleted successfully');
            },
            onError: (error) => {
                toast.error(error?.message || 'Error deleting tag');
            },
        });
    };

    return (
        <>
            <Head title="Tags" />

            <AppLayout breadcrumbs={breadcrumbs}>
                <div className="container mx-auto space-y-4 p-4">
                    <div className="mx-4 mt-2 mb-8 flex justify-between">
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">Manage your tags</h1>
                            <p className="text-muted-foreground mt-2 text-sm">Type and press Enter, Space or Comma to add multiple tags.</p>
                            <p className="text-muted-foreground mt-2 text-sm">Press Backspace to remove a tag.</p>
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
                                    {pendingTags.map((tag, index) => (
                                        <Badge key={index} variant="secondary" className="bg-primary/20 text-primary hover:bg-primary/30">
                                            {tag}
                                            <button
                                                type="button"
                                                onClick={() => setPendingTags(pendingTags.filter((_, i) => i !== index))}
                                                className="hover:text-destructive ml-1"
                                            >
                                                <X className="h-3 w-3" />
                                            </button>
                                        </Badge>
                                    ))}
                                </div>
                                <div className="flex space-x-2">
                                    <Input
                                        value={tagInput}
                                        onChange={(e) => setTagInput(e.target.value)}
                                        onKeyDown={handleKeyDown}
                                        placeholder="Type tag names..."
                                        className="flex-1"
                                    />
                                    <Button type="submit" disabled={pendingTags.length === 0}>
                                        <Plus className="mr-2 h-4 w-4" />
                                        Save Tags
                                    </Button>
                                </div>
                            </div>
                        </form>

                        <div className="mt-8">
                            <h2 className="mb-4 text-lg font-semibold">Existing Tags</h2>
                            <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                {tags.map((tag) => (
                                    <div key={tag.id} className="flex items-center justify-between rounded-lg border p-3">
                                        <span className="truncate">{tag.name}</span>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => deleteTag(tag.id)}
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
