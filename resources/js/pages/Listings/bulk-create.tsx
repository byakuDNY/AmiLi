import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { FileText, Upload } from 'lucide-react';
import { FormEvent, useState } from 'react';
import { toast } from 'sonner';

interface BulkListing {
    name: string;
    description?: string;
    author?: string;
    type: string; // Changed from type_id to type
    tags: string; // Made required
    imageUrl?: string;
    link?: string;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Listings',
        href: '/listings',
    },
    {
        title: 'Bulk Create',
        href: '/listings/bulk-create',
    },
];

const sampleData: BulkListing[] = [
    {
        name: 'Sample Listing 1',
        description: 'Description for listing 1',
        author: 'John Doe',
        type: 'Movie', // Changed to type name instead of ID
        tags: 'action, adventure', // Required now
        imageUrl: 'https://example.com/image1.jpg',
        link: 'https://example.com/1',
    },
    {
        name: 'Sample Listing 2',
        description: 'Description for listing 2',
        author: 'Jane Smith',
        type: 'Series', // Changed to type name instead of ID
        tags: 'drama, comedy', // Required now
        imageUrl: 'https://example.com/image2.jpg',
        link: 'https://example.com/2',
    },
];

export default function BulkCreateListings() {
    const [listingsData, setListingsData] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const loadSampleData = () => {
        setListingsData(JSON.stringify(sampleData, null, 2));
        toast.success('Sample data loaded');
    };

    const validateJson = (json: string): boolean => {
        try {
            const data = JSON.parse(json);
            if (!Array.isArray(data)) {
                toast.error('Data must be an array of listings');
                return false;
            }
            return true;
        } catch (error) {
            console.error('Invalid JSON format:', error);
            toast.error('Invalid JSON format');
            return false;
        }
    };

    const submitForm = (e: FormEvent) => {
        e.preventDefault();

        if (!validateJson(listingsData)) {
            return;
        }

        setIsSubmitting(true);
        router.post(
            '/listings/bulk',
            { listingsData },
            {
                onSuccess: () => {
                    toast.success('Listings created successfully');
                    setListingsData('');
                },
                onError: (errors) => {
                    Object.values(errors).forEach((error) => {
                        console.error(error);
                        toast.error(error);
                    });
                },
                onFinish: () => setIsSubmitting(false),
            },
        );
    };

    return (
        <>
            <Head title="Bulk Create Listings" />

            <AppLayout breadcrumbs={breadcrumbs}>
                <div className="container mx-auto space-y-4 p-4">
                    <div className="mx-4 mt-2 mb-8">
                        <h1 className="text-3xl font-bold tracking-tight">Bulk Create Listings</h1>
                        <p className="text-muted-foreground mt-2 text-sm">Create multiple listings at once using JSON format.</p>
                    </div>

                    <div className="bg-card mx-4 rounded-lg border p-6 shadow-sm">
                        <form onSubmit={submitForm} className="space-y-6">
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-1">
                                        <Label htmlFor="listingsData" className="text-sm font-medium">
                                            Listings Data (JSON format)
                                        </Label>
                                        <p className="text-muted-foreground text-sm">
                                            Paste your JSON data here or load the sample data to see the format
                                        </p>
                                    </div>
                                    <Button type="button" variant="outline" size="sm" onClick={loadSampleData}>
                                        <FileText className="mr-2 h-4 w-4" />
                                        Load Sample
                                    </Button>
                                </div>

                                <Textarea
                                    id="listingsData"
                                    value={listingsData}
                                    onChange={(e) => setListingsData(e.target.value)}
                                    className="h-[500px] font-mono"
                                    required
                                />
                            </div>

                            <div className="flex items-center justify-end space-x-4 pt-4">
                                <Button type="button" variant="outline" onClick={() => router.visit('/listings')} disabled={isSubmitting}>
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={isSubmitting}>
                                    {isSubmitting ? (
                                        'Creating...'
                                    ) : (
                                        <>
                                            <Upload className="mr-2 h-4 w-4" />
                                            Create Listings
                                        </>
                                    )}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            </AppLayout>
        </>
    );
}
