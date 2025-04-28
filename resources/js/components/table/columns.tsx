import { ColumnDef } from '@tanstack/react-table';

import ColumnHeader from '@/components/table/column-header';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

import { Listing, Tag, Type } from '@/types';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import RowActions from './row-actions';

const Columns: ColumnDef<Listing>[] = [
    {
        accessorKey: 'imageUrl',
        header: ({ column }) => <ColumnHeader column={column} title="ImageUrl" />,
        cell: ({ row }) => {
            const imageUrl = row.getValue('imageUrl') as string;
            return (
                <Avatar>
                    <AvatarImage src={imageUrl} alt={`${imageUrl}'s avatar`} className="object-cover" />
                    <AvatarFallback className="text-xs font-medium">{'AV'}</AvatarFallback>
                </Avatar>
            );
        },
        enableSorting: false,
    },
    {
        accessorKey: 'name',
        header: ({ column }) => <ColumnHeader column={column} title="Name" />,
        cell: ({ row }) => {
            const name = row.getValue('name') as string;
            return (
                <Tooltip>
                    <TooltipTrigger className="flex w-full max-w-[200px]">
                        <p className="text-muted-foreground truncate text-sm">{name}</p>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="max-w-[300px]">
                        <p className="text-sm">{name}</p>
                    </TooltipContent>
                </Tooltip>
            );
        },
        enableHiding: false,
    },
    {
        accessorKey: 'description',
        header: 'Description',
        cell: ({ row }) => {
            const description = row.getValue('description') as string;
            return (
                <Tooltip>
                    <TooltipTrigger className="flex w-full max-w-[200px]">
                        <p className="text-muted-foreground truncate text-sm">{description}</p>
                    </TooltipTrigger>
                    <TooltipContent side="right" className="max-w-[300px]">
                        <p className="text-sm">{description}</p>
                    </TooltipContent>
                </Tooltip>
            );
        },
        enableSorting: false,
    },
    {
        accessorKey: 'author',
        header: ({ column }) => <ColumnHeader column={column} title="Author" />,
        cell: ({ row }) => {
            const author = row.getValue('author') as string;
            return (
                <Tooltip>
                    <TooltipTrigger className="flex w-full max-w-[200px]">
                        <p className="text-muted-foreground truncate text-sm">{author}</p>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="max-w-[300px]">
                        <p className="text-sm">{author}</p>
                    </TooltipContent>
                </Tooltip>
            );
        },
    },
    {
        accessorKey: 'type',
        header: ({ column }) => <ColumnHeader column={column} title="Type" />,
        cell: ({ row }) => {
            const type = row.original.type as Type | null;

            if (!type) {
                return;
            }

            return (
                <span className="bg-primary/20 text-secondary-foreground inline-flex items-center truncate rounded px-2.5 py-0.5 text-sm">
                    {type.name}
                </span>
            );
        },
        filterFn: (row, id, filterValues: string[]) => {
            if (!filterValues.length) return true;
            const types = row.original.type as Type;
            return filterValues.some((filterValue) => types?.name.toLowerCase() === filterValue.toLowerCase());
        },
        enableSorting: false,
    },
    {
        accessorKey: 'tag',
        header: ({ column }) => <ColumnHeader column={column} title="Tag" />,
        cell: ({ row }) => {
            const tags = row.original.tags as Tag[] | null;

            if (!tags) {
                return;
            }

            return (
                <Tooltip>
                    <TooltipTrigger className="flex w-full">
                        <div className="flex flex-wrap gap-1 overflow-hidden">
                            {tags.map((tag) => (
                                <span
                                    key={tag.id}
                                    className="bg-primary/10 text-primary inline-flex items-center truncate rounded-full px-2.5 py-0.5 text-xs font-medium"
                                >
                                    {tag.name}
                                </span>
                            ))}
                        </div>
                    </TooltipTrigger>
                    <TooltipContent className="flex max-w-[300px] flex-wrap gap-1 p-2">
                        {tags.map((tag) => (
                            <span
                                key={tag.id}
                                className="bg-accent text-accent-foreground inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap"
                            >
                                {tag.name}
                            </span>
                        ))}
                    </TooltipContent>
                </Tooltip>
            );
        },
        filterFn: (row, id, filterValues: string[]) => {
            if (!filterValues.length) return true;
            const tags = row.original.tags as Tag[];
            return filterValues.some((filterValue) => tags?.some((tag) => tag.name.toLowerCase() === filterValue.toLowerCase()));
        },
        enableSorting: false,
    },
    {
        accessorKey: 'actions',
        header: 'Actions',
        cell: ({ row }) => {
            return <RowActions row={row} />;
        },
        enableSorting: false,
        enableHiding: false,
    },
];

export default Columns;
