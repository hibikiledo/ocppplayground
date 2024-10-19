import invariant from "tiny-invariant";
import { ParsedOcppMessage } from "../../../hooks/useConnection";
import { ReplyComposerEditor } from "../ReplyComposerEditor";
import { accepted, pending, rejected } from "./presets";

export const BootNotificationComposer = (props: {
    message: ParsedOcppMessage;
    onSend: (rawMessage: string) => void;
}) => {
    invariant(props.message.msgType === 2);

    return (
        <ReplyComposerEditor
            message={props.message}
            onSend={props.onSend}
            presets={[
                { label: "Accepted", content: accepted },
                { label: "Pending", content: pending },
                { label: "Rejected", content: rejected },
            ]}
        />
    );
};
