import { Button } from "@nextui-org/react";
import { useEffect, useState } from "react";
import invariant from "tiny-invariant";
import { CodeEditor } from "../../components/CodeEditor/CodeEditor";
import { CodeEditorReadOnly } from "../../components/CodeEditor/CodeEditorReadOnly";
import { ParsedOcppMessage } from "../../hooks/useConnection";
import { formatJson } from "../formatJson";

export const ReplyComposerEditor = (props: {
    message: ParsedOcppMessage;
    onSend: (rawMessage: string) => void;
    presets: { label: string; content: string }[];
}) => {
    invariant(props.message.msgType === 2);

    const [builderValue, setBuilderValue] = useState("");
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
            `[3,"${props.message.uniqueId}",${JSON.stringify(evalResult)}]`
        );
    };

    return (
        <div className="flex flex-col gap-2">
            <div className="flex flex-col gap-1">
                <div className="text-sm text-foreground-700">Presets</div>
                <div className="flex gap-2">
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
