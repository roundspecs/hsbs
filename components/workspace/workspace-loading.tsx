import { Spinner } from '../ui/spinner'

const WorkspaceLoading = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background gap-4">
      <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center shadow-sm">
        <span className="text-primary-foreground font-bold text-lg">H</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <Spinner className="size-6 text-primary" />
        <p className="text-muted-foreground text-sm font-medium animate-pulse">
          Loading Workspace...
        </p>
      </div>
    </div>
  )
}

export default WorkspaceLoading