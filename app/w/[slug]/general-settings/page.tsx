import WorkspaceSettings from '@/components/workspace/workspace-settings';

export default async function Page({ params }: { params: any }) {
  const p = await params;
  const slug = p?.slug ?? '';
  return <WorkspaceSettings slug={slug} />;
}
