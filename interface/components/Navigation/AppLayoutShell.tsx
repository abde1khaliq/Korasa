"use client";

import { ReactNode, useState } from "react";
import { AppSidebar } from "./AppSidebar";
import { AppTopHeader } from "./AppTopHeader";
import { QuickCreateModal } from "@/components/HomeSubjects/QuickCreateModal";
import { Notification } from "@/components/misc/Notification";
import { useSubjects } from "@/app/hooks/useSubjects";
import { useNotification } from "@/app/hooks/useNotification";
import { useSession } from "next-auth/react";

interface AppLayoutShellProps {
  children: ReactNode;
  title?: string;
  breadcrumbs?: { label: string; href?: string }[];
}

export function AppLayoutShell({
  children,
  title,
  breadcrumbs,
}: AppLayoutShellProps) {
  const { data: session } = useSession();
  const [showQuickCreate, setShowQuickCreate] = useState(false);
  const { subjects, updateSubjectCounts } = useSubjects();
  const { notification, showNotification } = useNotification();

  const handleFolderCreated = (subjectId: number) => {
    updateSubjectCounts(subjectId, "folder");
    showNotification("Folder created");
  };

  const handleQuestionCreated = (subjectId: number) => {
    updateSubjectCounts(subjectId, "question");
    showNotification("Question created");
  };

  return (
    <div className="flex min-h-screen bg-paper text-ink">
      {/* Desktop Sidebar */}
      <AppSidebar onQuickCreate={() => setShowQuickCreate(true)} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 pb-12">
        <AppTopHeader
          title={title}
          breadcrumbs={breadcrumbs}
          onQuickCreate={() => setShowQuickCreate(true)}
        />

        <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-8 py-6">
          {children}
        </main>
      </div>

      {/* Global Quick Create Modal */}
      {showQuickCreate && (
        <QuickCreateModal
          subjects={subjects}
          accessToken={session?.accessToken}
          onClose={() => setShowQuickCreate(false)}
          onFolderCreated={handleFolderCreated}
          onQuestionCreated={handleQuestionCreated}
        />
      )}

      {/* Global Notification Toast */}
      <Notification message={notification} />
    </div>
  );
}
