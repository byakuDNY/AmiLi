import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, ListingFormData, Tag, Type } from '@/types';
import { Head, router } from '@inertiajs/react';
import { FormEvent, useState } from 'react';
import { toast } from 'sonner';

interface Props {
    availableTags: Tag[];
    availableTypes: Type[];
}

const initialForm: ListingFormData = {
    name: '',
    description: '',
    author: '',
    type_id: '',
    tags: [],
    imageUrl: '',
    link: '',
};

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Listings',
        href: '/listings',
    },
    {
        title: 'Create',
        href: '/listings/create',
    },
];

export default function CreateListing({ availableTags, availableTypes }: Props) {
    const [form, setForm] = useState<ListingFormData>(initialForm);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleTagSelect = (tagId: string) => {
        const id = parseInt(tagId);
        setForm((prev) => ({
            ...prev,
            tags: prev.tags.includes(id) ? prev.tags.filter((t) => t !== id) : [...prev.tags, id],
        }));
    };

    const submitForm = (e: FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        router.post(
            '/listings',
            { ...form },
            {
                onSuccess: () => {
                    toast.success('Listing created successfully');
                    setForm(initialForm);
                },
                onError: (errors) => {
                    Object.values(errors).forEach((error) => {
                        toast.error(error);
                    });
                },
                onFinish: () => {
                    setIsSubmitting(false);
                },
            },
        );
    };

    return (
        <>
            <Head title="Create Listing" />

            <AppLayout breadcrumbs={breadcrumbs}>
                <div className="container mx-auto space-y-4 p-4">
                    <div className="mx-4 mt-2 mb-8">
                        <h1 className="text-3xl font-bold tracking-tight">Create New Listing</h1>
                        <p className="text-muted-foreground mt-2 text-sm">Add a new listing to your collection.</p>
                    </div>

                    <div className="bg-card mx-4 rounded-lg border p-6 shadow-sm">
                        <form onSubmit={submitForm} className="space-y-6">
                            <div className="grid gap-6 md:grid-cols-2">
                                {/* Basic Information */}
                                <div className="space-y-2">
                                    <Label htmlFor="name">Name</Label>
                                    <Input
                                        id="name"
                                        value={form.name}
                                        onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                                        placeholder="Enter listing name"
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="author">Author</Label>
                                    <Input
                                        id="author"
                                        value={form.author}
                                        onChange={(e) => setForm((prev) => ({ ...prev, author: e.target.value }))}
                                        placeholder="Enter author name"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="type">Type</Label>
                                    <Select value={form.type_id ?? ''} onValueChange={(value) => setForm((prev) => ({ ...prev, type_id: value }))}>
                                        <SelectTrigger id="type">
                                            <SelectValue placeholder="Select type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {availableTypes.map((type) => (
                                                <SelectItem key={type.id} value={type.id.toString()}>
                                                    {type.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Tags Selection */}
                                <div className="space-y-2">
                                    <Label htmlFor="tags">Tags</Label>
                                    <div className="flex flex-wrap gap-2 rounded-lg border p-2">
                                        {availableTags.map((tag) => (
                                            <Button
                                                key={tag.id}
                                                type="button"
                                                variant={form.tags.includes(tag.id) ? 'default' : 'outline'}
                                                size="sm"
                                                onClick={() => handleTagSelect(tag.id.toString())}
                                            >
                                                {tag.name}
                                            </Button>
                                        ))}
                                    </div>
                                </div>

                                {/* Description - Full Width */}
                                <div className="space-y-2 md:col-span-2">
                                    <Label htmlFor="description">Description</Label>
                                    <Input
                                        id="description"
                                        value={form.description}
                                        onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                                        placeholder="Enter description"
                                        className="min-h-[100px]"
                                    />
                                </div>

                                {/* URLs */}
                                <div className="space-y-2">
                                    <Label htmlFor="imageUrl">Image URL</Label>
                                    <Input
                                        id="imageUrl"
                                        value={form.imageUrl}
                                        onChange={(e) => setForm((prev) => ({ ...prev, imageUrl: e.target.value }))}
                                        placeholder="Enter image URL"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="link">Link</Label>
                                    <Input
                                        id="link"
                                        value={form.link}
                                        onChange={(e) => setForm((prev) => ({ ...prev, link: e.target.value }))}
                                        placeholder="Enter link URL"
                                    />
                                </div>
                            </div>

                            {/* Form Actions */}
                            <div className="flex items-center justify-end space-x-4 pt-4">
                                <Button type="button" variant="outline" onClick={() => setForm(initialForm)} disabled={isSubmitting}>
                                    Reset
                                </Button>
                                <Button type="submit" disabled={isSubmitting}>
                                    {isSubmitting ? 'Creating...' : 'Create Listing'}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            </AppLayout>
        </>
    );
}
