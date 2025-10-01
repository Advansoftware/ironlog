import { PageHeader } from '@/components/page-header';
import { ProgressClient } from './client';

export default function ProgressPage() {
  return (
    <>
      <PageHeader
        title="Progresso"
        description="Visualize seu progresso e obtenha insights com IA."
      />
      <ProgressClient />
    </>
  );
}
