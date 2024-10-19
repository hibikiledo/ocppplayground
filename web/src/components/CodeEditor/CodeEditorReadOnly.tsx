import { javascript } from "@codemirror/lang-javascript";
import ReactCodeMirror from "@uiw/react-codemirror";

export const CodeEditorReadOnly = (props: { value: string }) => {
    return (
        <ReactCodeMirror
            value={props.value}
            extensions={[javascript()]}
            readOnly
        />
    );
};
