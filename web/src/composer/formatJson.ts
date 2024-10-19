import { FracturedJsonOptions, EolStyle, Formatter } from "fracturedjsonjs";

export const formatJson = (json: any) => {
    const options = new FracturedJsonOptions();
    options.MaxTotalLineLength = 80;
    options.MaxInlineComplexity = 1;
    options.AlwaysExpandDepth = 0;
    options.JsonEolStyle = EolStyle.Crlf;

    const formatter = new Formatter();
    formatter.Options = options;

    return formatter.Serialize(json)?.replace(/\r\n$/, "");
};
