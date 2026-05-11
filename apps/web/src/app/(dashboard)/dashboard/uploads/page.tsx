import { UploadsPage } from '@/components/failure/uploads-page';

export default function UploadsRoute() {
  // In a real app, get projectId from URL params or context
  const projectId = 'demo-project-id';

  return <UploadsPage projectId={projectId} />;
}