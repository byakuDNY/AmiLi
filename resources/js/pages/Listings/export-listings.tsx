import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type Listing } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Download } from 'lucide-react';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';

interface ExportListingsPageProps {
  listings: Listing[];
}

interface FieldConfig {
  key: string;
  label: string;
  enabled: boolean;
}

const ExportListingsPage = ({ listings }: ExportListingsPageProps) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [fields, setFields] = useState<FieldConfig[]>([
    { key: 'id', label: 'ID', enabled: true },
    { key: 'name', label: 'Name', enabled: true },
    { key: 'description', label: 'Description', enabled: true },
    { key: 'author', label: 'Author', enabled: true },
    { key: 'imageUrl', label: 'Image URL', enabled: true },
    { key: 'link', label: 'Link', enabled: true },
    { key: 'type', label: 'Type', enabled: true },
    { key: 'tags', label: 'Tags', enabled: true },
    { key: 'created_at', label: 'Created Date', enabled: false },
    { key: 'updated_at', label: 'Updated Date', enabled: false },
  ]);

  const breadcrumbs: BreadcrumbItem[] = [
    {
      title: 'Listings',
      href: '/listings',
    },
    {
      title: 'Export Listings',
      href: '/listings/export-listings',
    },
  ];

  const filteredListings = useMemo(() => {
    const enabledFields = fields.filter(f => f.enabled).map(f => f.key);
    return listings.map(listing => {
      const filteredListing: Record<string, unknown> = {};
      enabledFields.forEach(field => {
        if (Object.prototype.hasOwnProperty.call(listing, field)) {
          filteredListing[field] = listing[field as keyof Listing];
        }
      });
      return filteredListing;
    });
  }, [listings, fields]);

  const jsonData = JSON.stringify(filteredListings, null, 2);

  const handleFieldToggle = (fieldKey: string) => {
    setFields(prev => prev.map(field =>
      field.key === fieldKey
        ? { ...field, enabled: !field.enabled }
        : field
    ));
  };

  const selectAllFields = () => {
    setFields(prev => prev.map(field => ({ ...field, enabled: true })));
  };

  const deselectAllFields = () => {
    setFields(prev => prev.map(field => ({ ...field, enabled: false })));
  };

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      const enabledFields = fields.filter(f => f.enabled).map(f => f.key);

      // Create a native form to bypass Inertia for file download
      const form = document.createElement('form');
      form.method = 'POST';
      form.action = '/listings/download';
      form.style.display = 'none';

      // Add CSRF token from meta tag
      const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');

      if (csrfToken) {
        const csrfInput = document.createElement('input');
        csrfInput.type = 'hidden';
        csrfInput.name = '_token';
        csrfInput.value = csrfToken;
        form.appendChild(csrfInput);
      }

      // Add fields
      enabledFields.forEach(field => {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = 'fields[]';
        input.value = field;
        form.appendChild(input);
      });

      document.body.appendChild(form);
      form.submit();
      document.body.removeChild(form);

      toast.success('Download started');
    } catch (error) {
      console.error('Download failed:', error);
      toast.error('Download failed');
    } finally {
      setIsDownloading(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      // Check if the modern Clipboard API is available
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(jsonData);
        console.info('Listings data copied to clipboard using modern API');
        toast.success('Listings data copied to clipboard');
      } else {
        // Fallback method for older browsers or insecure contexts
        const textArea = document.createElement('textarea');
        textArea.value = jsonData;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();

        const successful = document.execCommand('copy');
        document.body.removeChild(textArea);

        if (successful) {
          console.info('Listings data copied to clipboard using legacy API');
          toast.success('Listings data copied to clipboard');
        } else {
          throw new Error('Copy command failed');
        }
      }
    } catch (error) {
      console.error('Copy failed:', error);
      toast.error('Copy failed. Please select and copy the text manually.');
    }
  };

  const enabledFieldsCount = fields.filter(f => f.enabled).length;

  return (
    <>
      <Head title="Export Listings" />

      <AppLayout breadcrumbs={breadcrumbs}>
        <div className="container mx-auto space-y-6 p-4">
          {/* Header Section */}
          <div className="mx-4 mt-2 mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Export Listings</h1>
                <p className="text-muted-foreground mt-2 text-sm">
                  Download your listings data as JSON format
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <Button asChild variant="outline" size="sm">
                  <Link href="/listings" className="inline-flex items-center">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Listings
                  </Link>
                </Button>
              </div>
            </div>
          </div>

          {/* Statistics */}
          <div className="mx-4 grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Listings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{listings.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Selected Fields</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{enabledFieldsCount}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">File Size</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {(new Blob([jsonData]).size / 1024).toFixed(1)} KB
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Field Selection */}
          <div className="mx-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Select Fields to Export</CardTitle>
                    <CardDescription>
                      Choose which fields to include in your export
                    </CardDescription>
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" onClick={selectAllFields}>
                      Select All
                    </Button>
                    <Button variant="outline" size="sm" onClick={deselectAllFields}>
                      Deselect All
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                  {fields.map((field) => (
                    <div key={field.key} className="flex items-center space-x-2">
                      <Checkbox
                        id={field.key}
                        checked={field.enabled}
                        onCheckedChange={() => handleFieldToggle(field.key)}
                      />
                      <Label
                        htmlFor={field.key}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {field.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* JSON Display and Actions */}
          <div className="mx-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Listings Data Preview</CardTitle>
                    <CardDescription>
                      JSON formatted data ready for export ({enabledFieldsCount} fields selected)
                    </CardDescription>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={copyToClipboard}
                      disabled={enabledFieldsCount === 0}
                    >
                      Copy to Clipboard
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleDownload}
                      disabled={isDownloading || enabledFieldsCount === 0}
                    >
                      <Download className="mr-2 h-4 w-4" />
                      {isDownloading ? 'Downloading...' : 'Download JSON'}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className='max-w-full'>
                <ScrollArea className="h-[600px] w-full rounded-md border">
                  <pre className="p-4 text-sm whitespace-pre-wrap">
                    <code className="language-json">
                      {enabledFieldsCount > 0 ? jsonData : 'No fields selected for export'}
                    </code>
                  </pre>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </div>
      </AppLayout>
    </>
  );
};

export default ExportListingsPage;