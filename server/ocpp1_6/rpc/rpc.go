package rpc

import (
	"fmt"
	"ocppplayground/ocpp1_6/message"
	"time"

	"github.com/gorilla/websocket"
)

type Rpc struct {
	pendingUniqueId string

	Conn    *websocket.Conn
	Timeout time.Duration
}

func (r *Rpc) Send(m *message.OcppCall) error {
	r.pendingUniqueId = m.UniqueId
	err := r.Conn.WriteMessage(websocket.TextMessage, []byte(m.ToString()))
	if err != nil {
		return fmt.Errorf("failed to send message")
	}

	return nil
}

func (r *Rpc) RecvResult(m *message.OcppCallResult) error {
	if m.UniqueId == r.pendingUniqueId {
		return nil
	} else {
		return fmt.Errorf("received unexpected message unique ID in RecvResult")
	}
}

func (r *Rpc) RecvError(m *message.OcppCallError) error {
	if m.UniqueId == r.pendingUniqueId {
		return nil
	} else {
		return fmt.Errorf("received unexpected message unique ID in RecvError")
	}
}
