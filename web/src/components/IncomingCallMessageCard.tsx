import {
    Card,
    CardHeader,
    Divider,
    CardBody,
    Textarea,
} from "@nextui-org/react";
import { FracturedJsonOptions, EolStyle, Formatter } from "fracturedjsonjs";
import { ParsedOcppMessage } from "../hooks/useConnection";
import invariant from "tiny-invariant";

export const IncomingCallMessageCard = (props: {
    message: ParsedOcppMessage;
}) => {
    invariant(props.message.msgType === 2);
    return (
        <Card>
            <CardHeader>
                <div className="text-sm font-semibold">
                    {props.message.action}.req
                </div>
            </CardHeader>
            <Divider />
            <CardBody>
                <Textarea
                    fullWidth
                    label="Payload"
                    value={formatJson(props.message.raw)}
                    readOnly
                    classNames={{
                        input: "whitespace-pre font-mono text-xs",
                    }}
                />
            </CardBody>
        </Card>
    );
};

const formatJson = (json: any) => {
    const options = new FracturedJsonOptions();
    options.MaxTotalLineLength = 80;
    options.MaxInlineComplexity = 1;
    options.JsonEolStyle = EolStyle.Crlf;

    const formatter = new Formatter();
    formatter.Options = options;

    return formatter.Serialize(json);
};
