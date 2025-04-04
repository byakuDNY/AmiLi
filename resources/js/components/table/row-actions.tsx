import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Listing } from '@/types';
import { Link, router } from '@inertiajs/react';
import { Row } from '@tanstack/react-table';
import { Edit, Link as LinkIcon, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface RowActionsProps<TData> {
    row: Row<TData>;
}

const RowActions = <TData,>({ row }: RowActionsProps<TData>) => {
    const { id, link } = row.original as Listing;

    const deleteListing = (id: number) => {
        router.delete(`/listings/${id}`, {
            preserveScroll: true,
            preserveState: true,
            onSuccess: () => {
                toast.success('Listing deleted successfully');
            },
            onError: () => {
                toast.error('There was an error deleting the listing');
            },
        });
    };

    return (
        <div className="flex items-center justify-around space-x-2">
            <Button variant="ghost" size="sm" className="m-0 p-0" asChild>
                <Link href={`/listings/${id}/edit`}>
                    <Edit className="size-4" />
                </Link>
            </Button>

            <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive m-0 p-0">
                        <Trash2 className="size-4" />
                    </Button>
                </AlertDialogTrigger>

                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>This action cannot be undone. This will permanently delete the listing.</AlertDialogDescription>
                    </AlertDialogHeader>

                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => deleteListing(id)} className="bg-destructive hover:bg-destructive/80">
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {link && (
                <Button size="sm" className="m-0 p-0" asChild>
                    <a href={link}>
                        <LinkIcon className="size-4" />
                    </a>
                </Button>
            )}
        </div>
    );
};

export default RowActions;
