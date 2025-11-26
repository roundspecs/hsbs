import { Spinner } from '../ui/spinner'

const WorkspaceLoading = () => {
  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center p-4">
      <div className="text-center">
        {/* Logo */}
        <div className="w-16 h-16 bg-linear-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
          <span className="text-white font-bold text-2xl">H</span>
        </div>

        {/* Loading Content */}
        <div className="bg-white/80 p-8 max-w-sm mx-auto">
          <div className="mb-6">
            <Spinner className="size-8 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-slate-900 mb-2">
              Loading Workspace
            </h2>
            <p className="text-slate-600">
              Please wait while we prepare your workspace...
            </p>
          </div>

        </div>
      </div>
    </div>
  )
}

export default WorkspaceLoading