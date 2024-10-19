import { Composer } from "../composer/Composer";
import { ParsedOcppMessage } from "../hooks/useConnection";
import { IncomingCallMessageCard } from "./IncomingCallMessageCard";

export const PendingMessageView = (props: {
    messages: ParsedOcppMessage[];
    onSend: (rawMessage: string) => void;
}) => {
    if (props.messages.length === 0) {
        return (
            <p className="text-sm text-foreground-400">No pending message</p>
        );
    }

    return (
        <>
            {props.messages.map((message) => {
                return (
                    <div key={message.key} className="flex flex-col gap-4">
                        <IncomingCallMessageCard message={message} />
                        <Composer message={message} onSend={props.onSend} />
                    </div>
                );
            })}
            <div className="h-[50vh]" />
        </>
    );
};
