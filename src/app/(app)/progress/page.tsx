import { PageHeader } from '@/components/page-header';
import { ProgressClient } from './client';

export default function ProgressPage() {
  return (
    <>
      <PageHeader
        title="Progress"
        description="Visualize your progress and get AI-powered insights."
      />
      <ProgressClient />
    </>
  );
}
