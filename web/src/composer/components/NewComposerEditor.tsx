import { Button } from "@nextui-org/react";
import { useEffect, useState } from "react";
import { CodeEditor } from "../../components/CodeEditor/CodeEditor";
import { CodeEditorReadOnly } from "../../components/CodeEditor/CodeEditorReadOnly";
import { formatJson } from "../formatJson";
export const NewComposerEditor = (props: {
  initialValue?: string;
  action: string;
  onSend: (rawMessage: string) => void;
  presets: { label: string; content: string }[];
}) => {
  const [builderValue, setBuilderValue] = useState(props.initialValue ?? "");
  const [evalError, setEvalError] = useState<string>();
  const [evalResult, setEvalResult] = useState<string>();
  const safeEval = (str: string) => {
    try {
      setEvalResult(eval(`const r=${str};r`));
      setEvalError(undefined);
    } catch (err) {
      console.error(err);
      setEvalResult(undefined);
      setEvalError(String(err));
    }
  };
  useEffect(() => {
    safeEval(builderValue);
  }, [builderValue]);

  const handleSend = () => {
    props.onSend(
      `[2,"${Math.floor((Math.random() + 1) * 1000)}","${
        props.action
      }",${JSON.stringify(evalResult)}]`
    );
  };

  return (
    <div className="flex flex-col gap-2">
      {props.presets.length > 0 && (
        <div className="flex flex-col gap-1">
          <div className="text-sm text-foreground-700">Presets</div>
          <div className="flex flex-wrap gap-2">
            {props.presets.map((preset) => {
              return (
                <Button
                  size="sm"
                  onClick={() => {
                    setBuilderValue(preset.content);
                  }}
                >
                  {preset.label}
                </Button>
              );
            })}
          </div>
        </div>
      )}
      <div className="flex flex-col gap-1">
        <div className="text-sm text-foreground-700">Builder</div>
        <CodeEditor
          value={builderValue}
          onChange={(value) => setBuilderValue(value)}
        />
      </div>
      <div className="flex flex-col gap-1">
        <div className="text-sm text-foreground-700">Preview</div>
        {evalError ? (
          <pre className="text-xs">{evalError}</pre>
        ) : (
          <CodeEditorReadOnly value={formatJson(evalResult) ?? ""} />
        )}
      </div>
      <Button color="primary" onClick={handleSend}>
        Send
      </Button>
    </div>
  );
};
