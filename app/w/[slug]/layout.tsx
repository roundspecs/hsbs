import WorkspaceClientLayout from "@/components/workspace/workspace-client-layout"

export const dynamic = 'force-dynamic'

export default async function WorkspaceLayout(props: any) {
  const { children, params } = await props
  const slug = (await params)?.slug ?? ''
  return (
    <WorkspaceClientLayout slug={slug}>{children}</WorkspaceClientLayout>
  )
}
