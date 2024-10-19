import invariant from "tiny-invariant";
import { ParsedOcppMessage } from "../hooks/useConnection";
import { DefaultComposerCard } from "./components/DefaultComposerCard/DefaultComposerCard";
import { BaseComposerCard } from "./components/BaseComposerCard/BaseComposerCard";
import { BootNotificationComposer } from "./components/BootNotificationComposer/BootNotificationComposer";

export const Composer = (props: {
    message: ParsedOcppMessage;
    onSend: (rawMessage: string) => void;
}) => {
    invariant(props.message.msgType === 2);

    switch (props.message.action) {
        case "BootNotification":
            return (
                <BaseComposerCard
                    composer={BootNotificationComposer}
                    message={props.message}
                    onSend={props.onSend}
                />
            );
        default: {
            return (
                <DefaultComposerCard
                    message={props.message}
                    onSend={props.onSend}
                />
            );
        }
    }
};
