import {
    ArrowLongLeftIcon,
    ArrowLongRightIcon,
} from "@heroicons/react/20/solid";
import {
    Chip,
    getKeyValue,
    Spinner,
    Table,
    TableBody,
    TableCell,
    TableColumn,
    TableHeader,
    TableRow,
} from "@nextui-org/react";
import clsx from "clsx";
import { formatJson } from "../composer/formatJson";
import { ParsedOcppMessage } from "../hooks/useConnection";

export const OcppMessageStream = (props: { messages: ParsedOcppMessage[] }) => {
    const rows = props.messages.map((it) => {
        switch (it.msgType) {
            case 2: {
                return {
                    ...it,
                    direction: <DirectionTableCell direction={it.direction} />,
                    msgType: (
                        <Chip
                            color="default"
                            size="sm"
                            classNames={{
                                base: "rounded-sm h-auto py-0.5 px-0",
                            }}
                        >
                            Call
                        </Chip>
                    ),
                    timestamp: (
                        <pre className="text-xs">
                            {it.receivedAt.toLocaleString()}
                        </pre>
                    ),
                    raw: (
                        <pre className="w-full overflow-hidden text-xs text-ellipsis">
                            {formatJson(it.raw)}
                        </pre>
                    ),
                    action: <ExpandButton onClick={() => {}} />,
                };
            }
            case 3: {
                return {
                    ...it,
                    direction: <DirectionTableCell direction={it.direction} />,
                    msgType: (
                        <Chip
                            color="success"
                            size="sm"
                            classNames={{
                                base: "rounded-sm h-auto py-0.5 px-0",
                            }}
                        >
                            CallResult
                        </Chip>
                    ),
                    timestamp: (
                        <pre className="text-xs">
                            {it.receivedAt.toLocaleString()}
                        </pre>
                    ),
                    raw: (
                        <pre className="w-full overflow-hidden text-xs text-ellipsis">
                            {formatJson(it.raw)}
                        </pre>
                    ),
                    action: <ExpandButton onClick={() => {}} />,
                };
            }
            case 4: {
                return {
                    ...it,
                    direction: <DirectionTableCell direction={it.direction} />,
                    msgType: (
                        <Chip
                            color="danger"
                            size="sm"
                            classNames={{
                                base: "rounded-sm h-auto py-0.5 px-0",
                            }}
                        >
                            CallError
                        </Chip>
                    ),
                    timestamp: (
                        <pre className="text-xs">
                            {it.receivedAt.toLocaleString()}
                        </pre>
                    ),
                    raw: (
                        <pre className="w-full overflow-hidden text-xs text-ellipsis">
                            {formatJson(it.raw)}
                        </pre>
                    ),
                    action: <ExpandButton onClick={() => {}} />,
                };
            }
            default: {
                throw Error("Invalid Type");
            }
        }
    });

    const columns = [
        { key: "timestamp", label: "TIMESTAMP" },
        {
            key: "direction",
            label: "DIRECTION",
        },
        {
            key: "msgType",
            label: "TYPE",
        },
        {
            key: "uniqueId",
            label: "UNIQUE ID",
        },
        {
            key: "raw",
            label: "MESSAGE",
        },
        {
            key: "action",
        },
    ];

    const widthByColumnKey: Record<string, any> = {
        timestamp: "190px",
        direction: "95px",
        msgType: "80px",
        uniqueId: "90px",
        raw: null,
        action: "80px",
    };

    return (
        <Table
            classNames={{
                table: "table-fixed",
            }}
            aria-label="Stream of OCPP messages"
            removeWrapper
            isStriped
            isHeaderSticky
            isCompact
        >
            <TableHeader columns={columns}>
                {(column) => (
                    <TableColumn
                        key={column.key}
                        width={widthByColumnKey[column.key]}
                    >
                        {column.label}
                    </TableColumn>
                )}
            </TableHeader>
            <TableBody
                className="whitespace-nowrap"
                items={rows}
                emptyContent={
                    <div className="flex justify-center gap-2">
                        <Spinner size="sm" color="default" />
                        <div className="text-sm text-foreground-400">
                            Waiting for the first message to arrive.
                        </div>
                    </div>
                }
            >
                {(item) => (
                    <TableRow key={item.key}>
                        {(columnKey) => (
                            <TableCell className="align-top">
                                {getKeyValue(item, columnKey)}
                            </TableCell>
                        )}
                    </TableRow>
                )}
            </TableBody>
        </Table>
    );
};

const ExpandButton = (props: { onClick: () => void }) => {
    return (
        <button
            className={clsx(
                "flex items-center gap-1 px-1 py-0.5 rounded-sm text-xs font-semibold text-foreground-500",
                "hover:text-primary-600 hover:bg-foreground-100"
            )}
            onClick={() => {
                props.onClick();
            }}
        >
            Expand
        </button>
    );
};

const DirectionTableCell = (props: { direction: "i" | "o" }) => {
    return (
        <div className="flex items-center gap-1 text-xs">
            {props.direction === "o" ? (
                <ArrowLongRightIcon width={20} />
            ) : (
                <ArrowLongLeftIcon width={20} />
            )}{" "}
            CS
        </div>
    );
};
