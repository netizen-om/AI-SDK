"use client";

import { useEffect, useState, useRef } from "react";
import { transformToWebContainerFormat } from "../hooks/transformer";
import { CheckCircle, Loader2, XCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { TemplateFolder } from "@/modules/playgound/lib/path-to-json";
import { WebContainer } from "@webcontainer/api";
import React from "react";

interface WebContainerPreviewProps {
  templateData: TemplateFolder;
  serverUrl: string;
  isLoading: boolean;
  error: string | null;
  instance: WebContainer | null;
  writeFileSync: (path: string, content: string) => Promise<void>;
  forceResetup?: boolean; // Optional prop to force re-setup
}

const WebContainerPreview = ({
  templateData,
  error,
  instance,
  isLoading,
  serverUrl,
  writeFileSync,
  forceResetup = false,
}: WebContainerPreviewProps) => {
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [loadingState, setLoadingState] = useState({
    transforming: false,
    mounting: false,
    installing: false,
    starting: false,
    ready: false,
  });
  const [currentStep, setCurrentStep] = useState(0);
  const totalSteps = 4;
  const [setupError, setSetupError] = useState<string | null>(null);
  const [isSetupComplete, setIsSetupComplete] = useState(false);
  const [isSetupInProgress, setIsSetupInProgress] = useState(false);

  useEffect(() => {
    async function setupContainer() {
      if (!instance || isSetupComplete || isSetupInProgress) return;

      try {
        setIsSetupInProgress(true);
        setSetupError(null);

        try {
          const packageJsonExists = await instance.fs.readFile(
            "package.json",
            "utf8"
          );

          if (packageJsonExists) {
            // TODO TERMINAL LOGIC
            instance.on("server-ready", (port: number, url: string) => {
              // TODO : TERMINAL

              setPreviewUrl(url);
              setLoadingState((prev) => ({
                ...prev,
                starting: false,
                ready: true,
              }));
            });

            setCurrentStep(4);
            setLoadingState((prev) => ({
              ...prev,
              starting: true,
            }));
          }
        } catch (error) {}

        // Step - 1 Transform Data
        setLoadingState((prev) => ({
          ...prev,
          transforming: true,
        }));
        setCurrentStep(1);

        // TERMINAL LOGIC

        //@ts-ignore
        const files = transformToWebContainerFormat(templateData);

        setLoadingState((prev) => ({
          ...prev,
          transforming: false,
          mounting: true,
        }));

        // Step - 2 mounting data
        setCurrentStep(2)

        // TERMINAL LOGIC
        
        await instance.mount(files)
        
        // TERMINAL LOGIC
        
        setLoadingState((prev) => ({
            ...prev,
            installing : true,
            mounting: false,
        }));
        setCurrentStep(3);
        
        // Step - 3 install dependencies inside container
        
        // TERMINAL LOGIC
        
        const installProcess = await instance.spawn("npm", ["install"])
        
        installProcess.output.pipeTo(
            new WritableStream({
                write(data) {
                    // TERMINAL LOGIC
                }
            })
        )
        


        

      } catch (error) {}
    }

    setupContainer();
  }, [instance, templateData, isSetupComplete, isSetupInProgress]);

  return <div>WebContainerPreview</div>;
};

export default WebContainerPreview;
