"use client";

import { usePermission } from "@/lib/usePermission";
import { Spinner } from "@/components/ui/spinner";
import { Lock } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface RequirePermissionProps {
    workspaceSlug: string;
    permission: string;
    children: React.ReactNode;
}

export default function RequirePermission({
    workspaceSlug,
    permission,
    children,
}: RequirePermissionProps) {
    const { hasPermission, loading } = usePermission(workspaceSlug, permission);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <Spinner className="w-8 h-8" />
            </div>
        );
    }

    if (!hasPermission) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-4">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                    <Lock className="w-8 h-8 text-muted-foreground" />
                </div>
                <h2 className="text-2xl font-semibold mb-2">Access Denied</h2>
                <p className="text-muted-foreground max-w-md mb-6">
                    You do not have permission to view this page. If you believe this is an error, please contact your workspace administrator.
                </p>
                <Button asChild variant="outline">
                    <Link href={`/w/${workspaceSlug}`}>
                        Return to Workspace
                    </Link>
                </Button>
            </div>
        );
    }

    return <>{children}</>;
}
