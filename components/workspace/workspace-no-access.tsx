"use client";

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { useAuth } from '@/lib/useAuth';
import { checkPendingRequest, createJoinRequest } from '@/lib/join-requests';
import { Lock, Send, CheckCircle, ArrowLeft } from 'lucide-react';

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
      const hasPending = await checkPendingRequest(workspaceId, user.uid);

      if (hasPending) {
        alert('You already have a pending request for this workspace.');
        setLoading(false);
        return;
      }

      // Create join request
      await createJoinRequest(workspaceId, {
        uid: user.uid,
        name: user.displayName || null,
        email: user.email || null,
        message: message.trim() || null,
        createdAt: null // Helper adds serverTimestamp
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
      <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-background">
        <div className="mx-auto flex w-full max-w-[350px] flex-col justify-center space-y-6">
          <div className="flex flex-col space-y-2 text-center">
            <div className="flex justify-center mb-2">
              <CheckCircle className="h-12 w-12 text-green-500" />
            </div>
            <h1 className="text-2xl font-semibold tracking-tight">
              Request Sent
            </h1>
            <p className="text-sm text-muted-foreground">
              Your request to join {workspaceName ? `"${workspaceName}"` : 'this workspace'} has been sent to the administrators.
            </p>
          </div>
          <Button
            onClick={() => router.push("/")}
            className="w-full"
            variant="outline"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Go Back Home
          </Button>
        </div>
      </div>
    );
  }

  if (showRequestForm) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-background">
        <div className="mx-auto flex w-full max-w-[350px] flex-col justify-center space-y-6">
          <div className="flex flex-col space-y-2 text-center">
            <div className="flex justify-center mb-2">
              <Send className="h-12 w-12 text-blue-500" />
            </div>
            <h1 className="text-2xl font-semibold tracking-tight">
              Request to Join
            </h1>
            <p className="text-sm text-muted-foreground">
              Send a request to join {workspaceName ? `"${workspaceName}"` : 'this workspace'}.
            </p>
          </div>

          <div className="grid gap-4">
            <div className="grid gap-2">
              <Textarea
                placeholder="Message (optional)"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="resize-none"
              />
            </div>
            <div className="grid gap-2">
              <Button
                onClick={handleRequestAccess}
                disabled={loading || !user}
              >
                {loading ? 'Sending...' : 'Send Request'}
              </Button>
              <Button
                variant="ghost"
                onClick={() => setShowRequestForm(false)}
                disabled={loading}
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
    <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-background">
      <div className="mx-auto flex w-full max-w-[350px] flex-col justify-center space-y-6">
        <div className="flex flex-col space-y-2 text-center">
          <div className="flex justify-center mb-2">
            <Lock className="h-12 w-12 text-muted-foreground" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Access Denied
          </h1>
          <p className="text-sm text-muted-foreground">
            You don't have permission to access this workspace.
          </p>
        </div>

        <div className="grid gap-2">
          {user && (
            <Button
              onClick={() => setShowRequestForm(true)}
              className="w-full"
            >
              Request to Join
            </Button>
          )}
          <Button
            onClick={() => router.push("/")}
            variant="outline"
            className="w-full"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Go Back Home
          </Button>
        </div>

        <p className="px-8 text-center text-sm text-muted-foreground">
          Contact your workspace administrator for access.
        </p>
      </div>
    </div>
  )
}

export default WorkspaceNoAccess