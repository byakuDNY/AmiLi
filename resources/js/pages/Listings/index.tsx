import DataTable from '@/components/table';
import Columns from '@/components/table/columns';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type Listing } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { Download, Plus } from 'lucide-react';

interface ListingsPageProps {
    listings: Listing[];
    // filters: {
    //     search?: string;
    // };
}

const ListingsPage = ({ listings }: ListingsPageProps) => {
    // const [search, setSearch] = useState(filters.search || '');

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Listings',
            href: '/listings',
        },
    ];

    // const handleSearch = (e: FormEvent) => {
    //     e.preventDefault();
    //     router.get('/listings', { search }, { preserveState: true });
    // };

    return (
        <>
            <Head title="Listings" />

            <AppLayout breadcrumbs={breadcrumbs}>
                <div className="container mx-auto space-y-4 p-4">
                    {/* Header Section */}
                    <div className="mx-4 mt-2 mb-8">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-3xl font-bold tracking-tight">Listings</h1>
                                <p className="text-muted-foreground mt-2 text-sm">Manage and view all your available listings</p>
                            </div>

                            <div className="flex items-center space-x-2">
                                {/* Search Form */}
                                {/* <form onSubmit={handleSearch} className="flex items-center space-x-2">
                                    <Input
                                        type="search"
                                        placeholder="Search by name or author..."
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        className="w-[300px]"
                                    />
                                    <Button type="submit" variant="secondary" size="sm">
                                        Search
                                    </Button>
                                </form> */}

                                {/* Action Buttons */}
                                <div className="flex items-center space-x-2">
                                    <Button asChild variant="outline" size="sm">
                                        <Link href="/listings/export-listings" className="inline-flex items-center">
                                            <Download className="mr-2 h-4 w-4" />
                                            Export Listings
                                        </Link>
                                    </Button>
                                    <Button asChild size="sm">
                                        <Link href="/listings/create" className="inline-flex items-center">
                                            <Plus className="mr-2 h-4 w-4" />
                                            Create Listing
                                        </Link>
                                    </Button>
                                    <Button asChild variant="outline" size="sm">
                                        <Link href="/listings/bulk-create" className="inline-flex items-center">
                                            <Plus className="mr-2 h-4 w-4" />
                                            Bulk Create
                                        </Link>
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Table Section */}
                    <DataTable columns={Columns} data={listings} />
                </div>
            </AppLayout>
        </>
    );
};

export default ListingsPage;
