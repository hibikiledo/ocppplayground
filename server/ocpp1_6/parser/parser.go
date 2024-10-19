package parser

import (
	"encoding/json"
	"fmt"
	"ocppplayground/ocpp1_6/message"
	"strconv"
)

func Parse(p *[]byte) (interface{}, error) {
	var parts []json.RawMessage
	err := json.Unmarshal(*p, &parts)
	if err != nil {
		return nil, fmt.Errorf("failed to parse bytes as JSON: %s", err.Error())
	}

	msgType, err := strconv.Atoi(string(parts[0]))
	if err != nil {
		return nil, fmt.Errorf("failed to parse message type as int: %s", err.Error())
	}

	if msgType == 2 && len(parts) == 4 {
		var uniqueId string
		json.Unmarshal(parts[1], &uniqueId)
		var action string
		json.Unmarshal(parts[2], &action)

		return message.OcppCall{
			UniqueId: uniqueId,
			Action:   action,
			Payload:  string(parts[3]),
		}, nil
	}

	if msgType == 3 && len(parts) == 3 {
		var uniqueId string
		json.Unmarshal(parts[1], &uniqueId)
		return message.OcppCallResult{
			UniqueId: uniqueId,
			Payload:  string(parts[2]),
		}, nil
	}

	if msgType == 4 && len(parts) == 5 {
		var uniqueId string
		json.Unmarshal(parts[1], &uniqueId)
		var errorCode string
		json.Unmarshal(parts[2], &errorCode)
		var errorDescription string
		json.Unmarshal(parts[3], &errorDescription)
		return message.OcppCallError{
			UniqueId:         uniqueId,
			ErrorCode:        errorCode,
			ErrorDescription: errorDescription,
			ErrorDetails:     string(parts[4]),
		}, nil
	}

	return nil, fmt.Errorf("unexpected message type %x", msgType)
}
