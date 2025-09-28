"use client";
import { Separator } from "@/components/ui/separator";
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { TemplateFileTree } from "@/modules/playgound/components/playgound-explorer";
import { useFileExplorer } from "@/modules/playgound/hooks/useFileExplorer";
import { usePlayground } from "@/modules/playgound/hooks/usePlayground";
import { TemplateFile } from "@prisma/client";
import { useParams } from "next/navigation";
import React, { useEffect } from "react";

const MainPlaygoundPage = () => {
  const { id } = useParams<{ id: string }>();

  const { playgroundData, templateData, isLoading, error, saveTemplateData } =
    usePlayground(id);

  const {
    activeFileId,
    setTemplateData,
    setActiveFileId,
    setPlaygroundId,
    setOpenFiles,
    closeAllFiles,
    openFile,
    openFiles,
  } = useFileExplorer();

  useEffect(() => {setPlaygroundId(id)}, [id, setPlaygroundId])

  useEffect(() => {
    if(templateData && !openFiles.length) {
      setTemplateData(templateData);
    }
  }, [templateData, setTemplateData, openFiles.length])

  const activeFile = openFiles.find((file) => file.id === activeFileId);
  const hasUnSavedChanges = openFiles.some((file) => file.hasUnsavedChanges);

  const handleFileSelect = (file : TemplateFile) {
    openFile(file)
  }

  return (
    <TooltipProvider>
      <>
        <TemplateFileTree
          data={templateData!}
          onFileSelect={handleFileSelect}
          selectedFile={activeFile}
          title="File Explorer"
          onAddFile={() => {}}
          onAddFolder={() => {}}
          onDeleteFile={() => {}}
          onDeleteFolder={() => {}}
          onRenameFile={() => {}}
          onRenameFolder={() => {}}
        />
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
          </header>

          <div className="flex flex-1 items-center gap-2">
            <div className="flex flex-col flex-1">
              <h1 className="text-sm font-medium">
                {playgroundData?.title || "Code playgound"}
              </h1>
            </div>
          </div>
        </SidebarInset>
      </>
    </TooltipProvider>
  );
};

export default MainPlaygoundPage;
