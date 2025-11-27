"use client";

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { db } from '@/lib/firebaseConfig';
import { useAuth } from '@/lib/useAuth';
import { collection, addDoc, serverTimestamp, query, where, getDocs } from 'firebase/firestore';

type WorkspaceNoAccessProps = {
  workspaceId: string;
  workspaceName?: string;
};

const WorkspaceNoAccess = ({ workspaceId, workspaceName }: WorkspaceNoAccessProps) => {
  const router = useRouter();
  const { user } = useAuth();
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [requestSent, setRequestSent] = useState(false);

  const handleRequestAccess = async () => {
    if (!user || !workspaceId) return;

    setLoading(true);
    try {
      // Check if user already has a pending request
      const requestsRef = collection(db, `workspaces/${workspaceId}/joinRequests`);
      const q = query(requestsRef, where('uid', '==', user.uid));
      const existingRequests = await getDocs(q);

      if (!existingRequests.empty) {
        alert('You already have a pending request for this workspace.');
        setLoading(false);
        return;
      }

      // Create join request
      await addDoc(collection(db, `workspaces/${workspaceId}/joinRequests`), {
        uid: user.uid,
        name: user.displayName || null,
        email: user.email || null,
        message: message.trim() || null,
        createdAt: serverTimestamp(),
      });

      setRequestSent(true);
      setMessage('');
    } catch (err) {
      console.error('Error requesting access:', err);
      alert('Failed to send request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (requestSent) {
    return (
      <div className="min-h-screen bg-linear-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center p-4">
        <div className="max-w-md mx-auto text-center">
          {/* Success Icon */}
          <div className="w-16 h-16 bg-linear-to-br from-green-100 to-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-200 p-8">
            <h1 className="text-2xl font-semibold text-slate-900 mb-3">
              Request Sent!
            </h1>
            <p className="text-slate-600 text-lg leading-relaxed mb-8">
              Your request to join {workspaceName ? `"${workspaceName}"` : 'this workspace'} has been sent to the administrators. You'll be notified once they review your request.
            </p>

            <Button
              onClick={() => router.push("/")}
              className="w-full h-12 bg-linear-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium rounded-xl transition-all duration-200"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Go Back Home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (showRequestForm) {
    return (
      <div className="min-h-screen bg-linear-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center p-4">
        <div className="max-w-md mx-auto text-center">
          {/* Icon */}
          <div className="w-16 h-16 bg-linear-to-br from-blue-100 to-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-200 p-8">
            <h1 className="text-2xl font-semibold text-slate-900 mb-3">
              Request to Join
            </h1>
            <p className="text-slate-600 text-base leading-relaxed mb-6">
              Send a request to join {workspaceName ? `"${workspaceName}"` : 'this workspace'}. The administrators will review your request.
            </p>

            <div className="text-left mb-6">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Message (optional)
              </label>
              <Textarea
                placeholder="Tell the admins why you'd like to join..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
                className="w-full"
              />
            </div>

            <div className="space-y-3">
              <Button
                onClick={handleRequestAccess}
                disabled={loading || !user}
                className="w-full h-12 bg-linear-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium rounded-xl transition-all duration-200"
              >
                {loading ? 'Sending...' : 'Send Request'}
              </Button>

              <Button
                variant="outline"
                onClick={() => setShowRequestForm(false)}
                disabled={loading}
                className="w-full h-12 border-2 border-slate-200 hover:border-slate-300 hover:bg-slate-50 rounded-xl transition-all duration-200"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
            You don't have permission to access this workspace. You can request to join or contact the workspace administrator.
          </p>

          <div className="space-y-3">
            {user && (
              <Button
                onClick={() => setShowRequestForm(true)}
                className="w-full h-12 bg-linear-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium rounded-xl transition-all duration-200"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
                Request to Join
              </Button>
            )}

            <Button
              onClick={() => router.push("/")}
              variant="outline"
              className="w-full h-12 border-2 border-slate-200 hover:border-slate-300 hover:bg-slate-50 rounded-xl transition-all duration-200"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Go Back Home
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