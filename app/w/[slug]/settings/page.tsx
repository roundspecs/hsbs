import WorkspaceSettings from '@/components/workspace/WorkspaceSettings';

export default async function Page({ params }: { params: any }) {
  const p = await params;
  const slug = p?.slug ?? '';
  return <WorkspaceSettings slug={slug} />;
  // return <p className='w-full'>Workspace settings laksjfl kjasdlf kjalsdkf jlasdj fla;sdkj f;lasdkj flas;dkj fas;dlkjf asdl; </p>
}
