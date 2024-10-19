package message

import "strings"

type OcppCall struct {
	UniqueId string
	Action   string
	Payload  string
}

func (o *OcppCall) ToString() string {
	var sb strings.Builder
	sb.WriteString("[")
	sb.WriteString("2,")
	sb.WriteString("\"")
	sb.WriteString(o.UniqueId)
	sb.WriteString("\"")
	sb.WriteString(",")
	sb.WriteString("\"")
	sb.WriteString(o.Action)
	sb.WriteString("\"")
	sb.WriteString(",")
	sb.WriteString(o.Payload)
	sb.WriteString("]")
	return sb.String()
}

type OcppCallResult struct {
	UniqueId string
	Payload  string
}

func (o *OcppCallResult) ToString() string {
	var sb strings.Builder
	sb.WriteString("[")
	sb.WriteString("3,")
	sb.WriteString("\"")
	sb.WriteString(o.UniqueId)
	sb.WriteString("\"")
	sb.WriteString(",")
	sb.WriteString(o.Payload)
	sb.WriteString("]")
	return sb.String()
}

type OcppCallError struct {
	UniqueId         string
	ErrorCode        string
	ErrorDescription string
	ErrorDetails     string
}

func (o *OcppCallError) ToString() string {
	var sb strings.Builder
	sb.WriteString("[")
	sb.WriteString("4,")
	sb.WriteString("\"")
	sb.WriteString(o.UniqueId)
	sb.WriteString("\"")
	sb.WriteString(",")
	sb.WriteString("\"")
	sb.WriteString(o.ErrorCode)
	sb.WriteString("\"")
	sb.WriteString(",")
	sb.WriteString("\"")
	sb.WriteString(o.ErrorDescription)
	sb.WriteString("\"")
	sb.WriteString(",")
	sb.WriteString(o.ErrorDetails)
	sb.WriteString("]")
	return sb.String()
}
