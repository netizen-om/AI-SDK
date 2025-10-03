"use client";
import { useEffect, useRef } from "react";
import {
  configureMonaco,
  defaultEditorOptions,
  getEditorLanguage,
} from "../lib/editor-config";
import { TemplateFile } from "../lib/path-to-json";
import { Monaco } from "@monaco-editor/react";
import MonacoEditor from "@monaco-editor/react";

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
  const disposablesRef = useRef<any[]>([]);
  let debounceTimer: NodeJS.Timeout;

  // Cleanup disposables on unmount
  useEffect(() => {
    const disposables = disposablesRef.current;
    return () => {
      disposables.forEach(disposable => disposable.dispose());
    };
  }, []);

  const handleEditorDidMount = (editor: any, monaco: Monaco) => {
    editorRef.current = editor;
    configureMonaco(monaco);

    // Get the current language (for future use if needed)
    // const currentLanguage = activeFile 
    //   ? getEditorLanguage(activeFile.fileExtension || "")
    //   : "javascript";

    // Register inline completion provider for multiple languages
    const supportedLanguages = ["javascript", "typescript", "python", "html", "css", "json"];
    
    supportedLanguages.forEach(language => {
        const disposable = monaco.languages.registerInlineCompletionsProvider(
          language,
          {
            provideInlineCompletions: async (model, position, context) => {
              // Only provide completions for the current file's language
              if (model.getLanguageId() !== language) {
                return { items: [] };
              }

              // Skip if there's already a selection
              if (context.selectedSuggestionInfo) {
                return { items: [] };
              }

              const suggestions = await new Promise<any[]>((resolve) => {
                clearTimeout(debounceTimer);
                debounceTimer = setTimeout(async () => {
                  try {
                    const code = model.getValue();
                    const offset = model.getOffsetAt(position);
                    
                    // Get text before cursor for context
                    const textBeforeCursor = code.substring(0, offset);
                    
                    // Skip if cursor is at the beginning or in comments
                    if (textBeforeCursor.trim().length === 0 || 
                        textBeforeCursor.trim().endsWith('//') ||
                        textBeforeCursor.trim().endsWith('/*')) {
                      console.log("Skipping completion: empty context or in comment");
                      resolve([]);
                      return;
                    }

                    // Skip if we're in the middle of a word (not at word boundary)
                    const lineText = model.getLineContent(position.lineNumber);
                    const charBefore = lineText.charAt(position.column - 2);
                    if (charBefore && /\w/.test(charBefore)) {
                      console.log("Skipping completion: in middle of word");
                      resolve([]);
                      return;
                    }

                    console.log(`Requesting completion for ${language} at position ${offset}`);
                    console.log("Context:", textBeforeCursor.substring(Math.max(0, textBeforeCursor.length - 50)));

                    const response = await fetch("/api/suggest", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        prompt: textBeforeCursor,
                        content: textBeforeCursor,
                        cursor: offset,
                        languageId: language,
                      }),
                    });

                    if (!response.ok) {
                      const errorData = await response.json().catch(() => ({}));
                      console.error("API Error:", response.status, errorData);
                      resolve([]);
                      return;
                    }

                    const data = await response.json();
                    
                    if (data.completion && data.completion.trim()) {
                      let completion = data.completion.trim();
                      
                      // Clean up the completion text (remove any unwanted prefixes/suffixes)
                      completion = completion
                        .replace(/^```\w*\n?/, '') // Remove code block markers
                        .replace(/\n?```$/, '') // Remove trailing code block markers
                        .replace(/^\[INST\]\s*/, '') // Remove instruction markers
                        .replace(/\s*\[\/INST\]$/, '') // Remove instruction end markers
                        .replace(/^<s>\s*/, '') // Remove start tokens
                        .replace(/\s*<\/s>$/, '') // Remove end tokens
                        .trim();
                      
                      // Only proceed if we have a meaningful completion
                      if (completion.length > 0 && completion.length < 1000) {
                        console.log(`Received completion: ${completion.substring(0, 50)}...`);
                        
                        // Create the completion item with proper range
                        const completionItem = {
                          insertText: completion,
                          range: {
                            startLineNumber: position.lineNumber,
                            endLineNumber: position.lineNumber,
                            startColumn: position.column,
                            endColumn: position.column,
                          },
                          command: {
                            id: "editor.action.inlineSuggest.commit",
                            title: "Accept suggestion",
                          },
                          // Add additional properties for better display
                          kind: monaco.languages.CompletionItemKind.Snippet,
                          sortText: "z", // Ensure it appears at the top
                          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                        };
                        
                        console.log("Created completion item:", completionItem);
                        console.log("Resolving with completion item");
                        resolve([completionItem]);
                      } else {
                        console.log("Completion too short or too long, skipping");
                        resolve([]);
                      }
                    } else {
                      console.log("No completion received");
                      resolve([]);
                    }
                  } catch (error) {
                    console.error("Completion fetch error:", error);
                    resolve([]);
                  }
                }, 800); // Increased debounce to 800ms
              });

              console.log(`Returning ${suggestions.length} suggestions for ${language}`);
              return { items: suggestions };
            },
            // Add the required freeInlineCompletions function
            // @ts-expect-error - freeInlineCompletions is required by Monaco but not in types
            freeInlineCompletions: (completions: any) => {
              // This function is called when completions are no longer needed
              // We don't need to do anything special here, just return the completions
              return completions;
            },
          }
        );
      
      disposablesRef.current.push(disposable);
    });
  };

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
        options={{
          ...defaultEditorOptions,
          // Enable inline suggestions with proper configuration
          inlineSuggest: { 
            enabled: true,
            mode: "prefix",
            showToolbar: "onHover"
          },
          // Additional suggestion settings
          suggest: {
            showKeywords: true,
            showSnippets: true,
            showFunctions: true,
            showConstructors: true,
            showFields: true,
            showVariables: true,
            showClasses: true,
            showStructs: true,
            showInterfaces: true,
            showModules: true,
            showProperties: true,
            showEvents: true,
            showOperators: true,
            showUnits: true,
            showValues: true,
            showConstants: true,
            showEnums: true,
            showEnumMembers: true,
            showColors: true,
            showFiles: true,
            showReferences: true,
            showFolders: true,
            showTypeParameters: true,
            showIssues: true,
            showUsers: true,
            showWords: true,
            // showCustomcolors: true, // This property doesn't exist in Monaco types
            showIcons: true,
          },
          // Quick suggestions
          quickSuggestions: {
            other: true,
            comments: false,
            strings: true
          },
          // Accept suggestions
          acceptSuggestionOnEnter: "on",
          acceptSuggestionOnCommitCharacter: true,
          // Tab completion
          tabCompletion: "on",
          // Word based suggestions
          wordBasedSuggestions: "matchingDocuments",
          // Parameter hints
          parameterHints: {
            enabled: true,
            cycle: true
          }
        } as any}
      />
    </div>
  );
};

export default PlaygoundEditor2;