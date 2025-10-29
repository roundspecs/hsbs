import LogoutBtn from "@/components/auth/LogoutBtn";
import NewWorkspaceDialog from "@/components/NewWorkspaceDialog";
import WorkspaceCard from "@/components/WorkspaceCard";

export default function Home() {
  const workspaces = [
    { name: "Zimmer Biomet", href: "/w/zimmer-biomet" },
    { name: "CONMED", href: "/w/conmed" },
  ];

  return (
    <main className="min-h-screen bg-white flex items-center justify-center p-6">
      <div className="w-full max-w-3xl">
        <header className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Workspaces</h1>
            <p className="text-sm text-slate-500">Select or create a workspace to get started</p>
          </div>
          <div className="flex items-center gap-3">
            {/* New workspace dialog trigger */}
            <NewWorkspaceDialog />
            <LogoutBtn />
          </div>
        </header>

        <section>
          <div className="rounded-lg border border-slate-100 bg-slate-50 p-6">
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {workspaces.map((w) => (
                <WorkspaceCard key={w.href} name={w.name} href={w.href} />
              ))}
            </ul>
          </div>
        </section>
      </div>
    </main>
  );
}
