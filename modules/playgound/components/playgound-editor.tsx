"use client";
import { useCallback, useEffect, useRef } from "react";
import {
  configureMonaco,
  defaultEditorOptions,
  getEditorLanguage,
} from "../lib/editor-config";
import { TemplateFile } from "../lib/path-to-json";
import { Editor, Monaco } from "@monaco-editor/react";
import { editor } from "monaco-editor";
import { logDisallowedDynamicError } from "next/dist/server/app-render/dynamic-rendering";

interface PlaygoundEditorProps {
  activeFile: TemplateFile | undefined;
  content: string;
  onContentChange: (value: string) => void;
}

const PlaygoundEditor = ({
  activeFile,
  content,
  onContentChange,
}: PlaygoundEditorProps) => {
  const editorRef = useRef<any>(null);
  const monacoRef = useRef<Monaco | null>(null);

  const handleEditorDidMount = (editor: any, monaco: Monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;
    console.log("Editor instance mounted : ", !!editorRef.current);

    editor.updateOptions({
      ...defaultEditorOptions,
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
    updateEditorLanguage()
  }, [])

  return (
    <div className="h-full relative">
      <Editor
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

export default PlaygoundEditor;
