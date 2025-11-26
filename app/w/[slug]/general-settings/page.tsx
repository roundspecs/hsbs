import GeneralSettings from '@/components/settings/general-settings';

export default async function Page({ params }: { params: any }) {
  const p = await params;
  const slug = p?.slug ?? '';
  return <GeneralSettings slug={slug} />;
}
