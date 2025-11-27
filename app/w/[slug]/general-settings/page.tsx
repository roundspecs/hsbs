import GeneralSettings from '@/components/settings/general-settings';
import RequirePermission from '@/components/auth/RequirePermission';

export default async function Page({ params }: { params: any }) {
  const p = await params;
  const slug = p?.slug ?? '';
  return (
    <RequirePermission workspaceSlug={slug} permission="manageWorkspace">
      <GeneralSettings slug={slug} />
    </RequirePermission>
  );
}
