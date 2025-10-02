"use client";
import { useEffect, useRef } from "react";
import {
  configureMonaco,
  defaultEditorOptions,
  getEditorLanguage,
} from "../lib/editor-config";
import { TemplateFile } from "../lib/path-to-json";
import { Editor, Monaco } from "@monaco-editor/react";
import MonacoEditor from "@monaco-editor/react";
import {
  registerCompletion,
  type CompletionRegistration,
  type StandaloneCodeEditor,
  registerCopilot,
} from "monacopilot";

interface PlaygoundEditorProps {
  activeFile: TemplateFile | undefined;
  content: string;
  onContentChange: (value: string) => void;
}

const PlaygoundEditor2 = ({
  activeFile,
  content,
  onContentChange,
}: PlaygoundEditorProps) => {
  const editorRef = useRef<any>(null);
  const monacoRef = useRef<Monaco | null>(null);
  const completionRef = useRef<CompletionRegistration | null>(null);

  const handleEditorDidMount = async(editor: any, monaco: Monaco) => {
    // --- DEBUG LOG 1 ---
    console.log("1. handleEditorDidMount has been called.");

    editorRef.current = editor;
    monacoRef.current = monaco;

    // --- DEBUG LOG 2 ---
    console.log(
      "2. Editor and Monaco instances are set:",
      !!editorRef.current,
      !!monacoRef.current
    );

    editor.updateOptions({
      ...defaultEditorOptions,
    });


    const completionParams = {
      endpoint: "/api/suggest",
      language: "javascript",
    };

    // --- DEBUG LOG 4 ---
    console.log(
      "4. Attempting to register completion with params:",
      completionParams
    );

    await registerCopilot(monaco, editor, {
      endpoint: "/api/suggest",
      language: "javascript",
    });

    configureMonaco(monaco);
    updateEditorLanguage();
  };

  const updateEditorLanguage = () => {
    if (!activeFile || !monacoRef.current || !editorRef.current) return;
    const model = editorRef.current.getModel();
    if (!model) return;

    const language = getEditorLanguage(activeFile.fileExtension || "");
    try {
      monacoRef.current.editor.setModelLanguage(model, language);
    } catch (error) {
      console.warn("Failed to set editor language:", error);
    }
  };

  useEffect(() => {
    updateEditorLanguage();
  }, [activeFile]);

  useEffect(() => {
    return () => {
      completionRef.current?.deregister();
    };
  }, []);

  return (
    <div className="h-full relative">
      <MonacoEditor
        height={"100%"}
        value={content}
        onChange={(value) => onContentChange(value || "")}
        onMount={handleEditorDidMount}
        language={
          activeFile
            ? getEditorLanguage(activeFile.fileExtension || "")
            : "plaintext"
        }
        //@ts-ignore
        options={defaultEditorOptions}
      />
    </div>
  );
};

export default PlaygoundEditor2;
