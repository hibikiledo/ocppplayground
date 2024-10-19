import { javascript } from "@codemirror/lang-javascript";
import ReactCodeMirror, { ReactCodeMirrorProps } from "@uiw/react-codemirror";

export const CodeEditor = (
    props: Omit<ReactCodeMirrorProps, "value" | "onChange"> & {
        value: string;
        onChange: (value: string) => void;
    }
) => {
    const { value, onChange, ...rest } = props;
    return (
        <ReactCodeMirror
            {...rest}
            value={props.value}
            extensions={[javascript()]}
            onChange={props.onChange}
        />
    );
};
