'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '~/trpc/react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '~/components/ui/button';
import { Card } from '~/components/ui/card';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { Textarea } from '~/components/ui/textarea';
import { Loader2, Plus, X, Save, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

// Form validation schema
const destinationSchema = z.object({
  id: z.string().optional(),
  city: z.string().min(1, "City is required"),
  country: z.string().min(1, "Country is required"),
  clues: z.array(z.string().min(1, "Clue cannot be empty")).min(1, "At least one clue is required"),
  funFacts: z.array(z.string()).default([]),
  trivia: z.array(z.string()).default([]),
  cdnImageUrl: z.string().url().optional().nullable(),
});

type DestinationFormValues = z.infer<typeof destinationSchema>;

interface DestinationFormProps {
  destinationId?: string;
}

export function DestinationForm({ destinationId }: DestinationFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const isEditMode = !!destinationId;
  
  // Form setup
  const form = useForm<DestinationFormValues>({
    resolver: zodResolver(destinationSchema),
    defaultValues: {
      city: '',
      country: '',
      clues: [''],
      funFacts: [''],
      trivia: [''],
      cdnImageUrl: '',
    },
  });
  
  // Get destination data for edit mode
  const { data: destination, isLoading: isLoadingDestination } = api.admin.getDestination.useQuery(
    { id: destinationId || '' },
    { enabled: isEditMode }
  );
  
  // Mutations for create/update
  const createDestination = api.admin.createDestination.useMutation({
    onSuccess: () => {
      toast.success('Destination created successfully');
      router.push('/admin/destinations');
    },
    onError: (error) => {
      toast.error('Failed to create destination', {
        description: error.message,
      });
      setIsLoading(false);
    },
  });
  
  const updateDestination = api.admin.updateDestination.useMutation({
    onSuccess: () => {
      toast.success('Destination updated successfully');
      router.push('/admin/destinations');
    },
    onError: (error) => {
      toast.error('Failed to update destination', {
        description: error.message,
      });
      setIsLoading(false);
    },
  });
  
  // Set form values when destination data is loaded (edit mode)
  useEffect(() => {
    if (destination) {
      form.reset({
        id: destination.id,
        city: destination.city,
        country: destination.country,
        clues: destination.clues.length > 0 ? destination.clues : [''],
        funFacts: destination.funFacts.length > 0 ? destination.funFacts : [''],
        trivia: destination.trivia.length > 0 ? destination.trivia : [''],
        cdnImageUrl: destination.cdnImageUrl,
      });
    }
  }, [destination, form]);
  
  // Form submission
  const onSubmit = (data: DestinationFormValues) => {
    setIsLoading(true);
    
    // Filter out empty strings from arrays
    const cleanedData = {
      ...data,
      clues: data.clues.filter(Boolean),
      funFacts: data.funFacts.filter(Boolean),
      trivia: data.trivia.filter(Boolean),
    };
    
    if (isEditMode) {
      updateDestination.mutate(cleanedData);
    } else {
      createDestination.mutate(cleanedData);
    }
  };
  
  // Array field handlers
  const addArrayField = (fieldName: 'clues' | 'funFacts' | 'trivia') => {
    const currentValues = form.getValues(fieldName);
    form.setValue(fieldName, [...currentValues, '']);
  };
  
  const removeArrayField = (fieldName: 'clues' | 'funFacts' | 'trivia', index: number) => {
    const currentValues = form.getValues(fieldName);
    if (currentValues.length > 1) {
      form.setValue(
        fieldName,
        currentValues.filter((_, i) => i !== index)
      );
    }
  };
  
  // Show loading during initial data fetch
  if (isEditMode && isLoadingDestination) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading destination data...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" asChild>
          <Link href="/admin/destinations">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">
          {isEditMode ? 'Edit Destination' : 'Add Destination'}
        </h1>
      </div>
      
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Destination Information</h2>
          
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                {...form.register('city')}
                placeholder="Enter city name"
                disabled={isLoading}
              />
              {form.formState.errors.city && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.city.message}
                </p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              <Input
                id="country"
                {...form.register('country')}
                placeholder="Enter country name"
                disabled={isLoading}
              />
              {form.formState.errors.country && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.country.message}
                </p>
              )}
            </div>
            
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="cdnImageUrl">Image URL</Label>
              <Input
                id="cdnImageUrl"
                {...form.register('cdnImageUrl')}
                placeholder="https://example.com/image.jpg"
                disabled={isLoading}
              />
              {form.formState.errors.cdnImageUrl && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.cdnImageUrl.message}
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                Enter a valid URL for an image of this destination
              </p>
            </div>
          </div>
        </Card>
        
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Clues</h2>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => addArrayField('clues')}
              disabled={isLoading}
            >
              <Plus className="h-4 w-4 mr-1" /> Add Clue
            </Button>
          </div>
          
          <div className="space-y-4">
            {form.watch('clues').map((_, index) => (
              <div key={index} className="flex gap-2">
                <div className="flex-1">
                  <Textarea
                    {...form.register(`clues.${index}`)}
                    placeholder="Enter a clue hint"
                    disabled={isLoading}
                    className="resize-none"
                  />
                  {form.formState.errors.clues?.[index] && (
                    <p className="text-sm text-destructive mt-1">
                      {form.formState.errors.clues[index]?.message}
                    </p>
                  )}
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => removeArrayField('clues', index)}
                  disabled={form.watch('clues').length <= 1 || isLoading}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
            
            {form.formState.errors.clues && !Array.isArray(form.formState.errors.clues) && (
              <p className="text-sm text-destructive">
                {form.formState.errors.clues.message}
              </p>
            )}
          </div>
        </Card>
        
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Fun Facts</h2>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => addArrayField('funFacts')}
              disabled={isLoading}
            >
              <Plus className="h-4 w-4 mr-1" /> Add Fact
            </Button>
          </div>
          
          <div className="space-y-4">
            {form.watch('funFacts').map((_, index) => (
              <div key={index} className="flex gap-2">
                <Textarea
                  {...form.register(`funFacts.${index}`)}
                  placeholder="Enter a fun fact"
                  disabled={isLoading}
                  className="flex-1 resize-none"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => removeArrayField('funFacts', index)}
                  disabled={form.watch('funFacts').length <= 1 || isLoading}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </Card>
        
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Trivia</h2>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => addArrayField('trivia')}
              disabled={isLoading}
            >
              <Plus className="h-4 w-4 mr-1" /> Add Trivia
            </Button>
          </div>
          
          <div className="space-y-4">
            {form.watch('trivia').map((_, index) => (
              <div key={index} className="flex gap-2">
                <Textarea
                  {...form.register(`trivia.${index}`)}
                  placeholder="Enter a trivia fact"
                  disabled={isLoading}
                  className="flex-1 resize-none"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => removeArrayField('trivia', index)}
                  disabled={form.watch('trivia').length <= 1 || isLoading}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </Card>
        
        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/admin/destinations')}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {isEditMode ? 'Updating...' : 'Creating...'}
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                {isEditMode ? 'Update Destination' : 'Create Destination'}
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
} 