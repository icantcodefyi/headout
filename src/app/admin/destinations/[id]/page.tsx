import { use } from 'react';
import { DestinationForm } from '~/components/admin/destination-form';

export default function EditDestinationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <DestinationForm destinationId={id} />;
} 