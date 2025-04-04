import { Table } from '@tanstack/react-table';
import { ArrowDown, ArrowRight, Circle, X } from 'lucide-react';

import ViewOptions from '@/components/table/view-options';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Listing } from '@/types';
import DataTableFacetedFilter from './faceted-filter';

interface ToolbarProps<TData> {
    table: Table<TData>;
}

export const types = [
    {
        label: 'Manga',
        value: 'manga',
        icon: ArrowDown,
    },
    {
        label: 'Anime',
        value: 'anime',
        icon: ArrowRight,
    },
];

const Toolbar = <TData,>({ table }: ToolbarProps<TData>) => {
    const isFiltered = table.getState().columnFilters.length > 0;

    const data = table.getCoreRowModel().rows.map((row) => row.original) as Listing[];

    // Get unique tags from the data
    const uniqueTags = Array.from(new Set(data.flatMap((listing) => listing.tags?.map((tag) => tag.name) || []))).map((tagName) => ({
        value: tagName.toLowerCase(),
        label: tagName,
        icon: Circle,
    }));

    return (
        <div className="flex items-center justify-between">
            <div className="flex flex-1 items-center space-x-2">
                <Input
                    placeholder="Search..."
                    value={(table.getColumn('name')?.getFilterValue() as string) ?? ''}
                    onChange={(event) => table.getColumn('name')?.setFilterValue(event.target.value)}
                    className="h-8 w-[150px] lg:w-[250px]"
                />
                {table.getColumn('tag') && <DataTableFacetedFilter column={table.getColumn('tag')} title="Tags" options={uniqueTags} />}
                {table.getColumn('type') && <DataTableFacetedFilter column={table.getColumn('type')} title="Types" options={types} />}
                {isFiltered && (
                    <Button
                        variant="ghost"
                        onClick={() => {
                            table.resetColumnFilters();
                            console.log(table.getAllColumns());
                        }}
                        className="h-8 px-2 lg:px-3"
                    >
                        Reset
                        <X />
                    </Button>
                )}
            </div>
            <ViewOptions table={table} />
        </div>
    );
};

export default Toolbar;
