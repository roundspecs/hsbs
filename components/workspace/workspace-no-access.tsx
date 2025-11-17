import { useRouter } from 'next/navigation';
import { Button } from '../ui/button';

const WorkspaceNoAccess = () => {
  const router = useRouter();
  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center p-4">
      <div className="max-w-md mx-auto text-center">
        {/* Icon */}
        <div className="w-16 h-16 bg-linear-to-br from-red-100 to-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>

        {/* Content */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-200 p-8">
          <h1 className="text-2xl font-semibold text-slate-900 mb-3">
            Access Denied
          </h1>
          <p className="text-slate-600 text-lg leading-relaxed mb-8">
            You don't have permission to access this workspace. Please contact your administrator or check if you're using the correct account.
          </p>

          <div className="space-y-3">
            <Button
              onClick={() => router.push("/")}
              className="w-full h-12 bg-linear-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium rounded-xl transition-all duration-200"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Go Back Home
            </Button>

            <Button
              variant="outline"
              onClick={() => window.location.reload()}
              className="w-full h-12 border-2 border-slate-200 hover:border-slate-300 hover:bg-slate-50 rounded-xl transition-all duration-200"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Try Again
            </Button>
          </div>
        </div>

        {/* Help Text */}
        <p className="text-sm text-slate-500 mt-6">
          Need help? Contact your workspace administrator for access.
        </p>
      </div>
    </div>
  )
}

export default WorkspaceNoAccess