'use client';

import { useState } from 'react';
import { api } from '~/trpc/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '~/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '~/components/ui/table';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '~/components/ui/pagination';
import { Edit, Plus, Search, Trash2, AlertTriangle, Globe, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '~/components/ui/alert-dialog';

export default function DestinationsPage() {
  const router = useRouter();
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');
  const [pageSize] = useState(10);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Get destinations with pagination
  const { data, isLoading, refetch } = api.admin.getAllDestinations.useQuery({
    skip: page * pageSize,
    take: pageSize,
    search: search || undefined,
  });
  
  // Delete mutation
  const deleteDestination = api.admin.deleteDestination.useMutation({
    onSuccess: () => {
      toast.success('Destination deleted successfully');
      refetch();
      setDeleteId(null);
      setIsDeleting(false);
    },
    onError: (error) => {
      toast.error('Failed to delete destination', {
        description: error.message,
      });
      setIsDeleting(false);
    },
  });
  
  // Handle delete confirmation
  const handleDelete = () => {
    if (!deleteId) return;
    
    setIsDeleting(true);
    deleteDestination.mutate({ id: deleteId });
  };
  
  // Handle pagination
  const handlePageChange = (newPage: number) => {
    if (newPage >= 0 && (!data || newPage < data.pageCount)) {
      setPage(newPage);
    }
  };
  
  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(0); // Reset to first page on new search
    refetch();
  };
  
  // If loading, show skeleton
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading destinations...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Destinations</h1>
          <p className="text-muted-foreground">
            Manage game destinations
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/destinations/new">
            <Plus className="mr-2 h-4 w-4" /> Add Destination
          </Link>
        </Button>
      </div>
      
      {/* Search Bar */}
      <form onSubmit={handleSearch} className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search by city or country..."
            className="pl-8"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Button type="submit">Search</Button>
      </form>
      
      {/* Destinations Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Destinations</CardTitle>
          <CardDescription>
            {data?.total || 0} total destinations
          </CardDescription>
        </CardHeader>
        <CardContent>
          {data && data.destinations.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>City</TableHead>
                  <TableHead>Country</TableHead>
                  <TableHead>Clues</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.destinations.map((destination) => (
                  <TableRow key={destination.id}>
                    <TableCell className="font-medium">{destination.city}</TableCell>
                    <TableCell>{destination.country}</TableCell>
                    <TableCell>{destination.clues.length}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => router.push(`/admin/destinations/${destination.id}`)}
                        >
                          <Edit className="h-4 w-4" />
                          <span className="sr-only">Edit</span>
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => setDeleteId(destination.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Delete</span>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="flex flex-col items-center justify-center py-12">
              <Globe className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No destinations found</h3>
              <p className="text-sm text-muted-foreground mt-1">
                {search ? 'Try a different search query' : 'Add your first destination to get started'}
              </p>
              {!search && (
                <Button asChild className="mt-4">
                  <Link href="/admin/destinations/new">
                    <Plus className="mr-2 h-4 w-4" /> Add Destination
                  </Link>
                </Button>
              )}
            </div>
          )}
        </CardContent>
        
        {/* Pagination */}
        {data && data.pageCount > 1 && (
          <CardFooter>
            <Pagination className="w-full">
              <PaginationContent>
                <PaginationItem>
                  {page > 0 ? (
                    <PaginationPrevious onClick={() => handlePageChange(page - 1)} />
                  ) : (
                    <PaginationPrevious className="cursor-not-allowed opacity-50" />
                  )}
                </PaginationItem>
                {Array.from({ length: data.pageCount }).map((_, i) => (
                  <PaginationItem key={i}>
                    <PaginationLink
                      onClick={() => handlePageChange(i)}
                      isActive={page === i}
                    >
                      {i + 1}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                <PaginationItem>
                  {page < data.pageCount - 1 ? (
                    <PaginationNext onClick={() => handlePageChange(page + 1)} />
                  ) : (
                    <PaginationNext className="cursor-not-allowed opacity-50" />
                  )}
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </CardFooter>
        )}
      </Card>
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the destination
              and all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete} 
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
} 