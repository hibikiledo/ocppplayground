package ocpp1_6

import (
	"context"
	"fmt"
	"log/slog"
	"net/http"
	"ocppplayground/ocpp1_6/config"

	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
}

func UpgradeToOcpp1_6(w http.ResponseWriter, req *http.Request) {
	cpIdentity := req.PathValue("identity")

	log := slog.With(
		"cpIdentity", cpIdentity,
		"url", &req.URL,
		"headers", &req.Header)
	ctx, _ := context.WithCancel(context.Background())

	if ok := config.CheckCpIdentity(cpIdentity); !ok {
		w.WriteHeader(404)
		log.Error(fmt.Sprintf("Charge point identity %s is not found", cpIdentity))
		return
	}

	subProtocols := websocket.Subprotocols(req)
	if len(subProtocols) == 0 {
		w.WriteHeader(400)
		w.Write([]byte("Missing Sec-WebSocket-Protocol in HTTP header"))
		log.Error("Missing Sec-WebSocket-Protocol in request HTTP header")
		return
	}

	if ok := checkSubprotocol(subProtocols); ok {
		conn, err := upgrader.Upgrade(w, req, http.Header{
			"Sec-WebSocket-Protocol": []string{"ocpp1.6"},
		})
		if err != nil {
			w.WriteHeader(500)
			log.Error("Cannot upgrade to websocket", "err", err)
			return
		}
		go HandleOcpp1_6(ctx, conn, cpIdentity)
	} else {
		conn, err := upgrader.Upgrade(w, req, http.Header{})
		if err != nil {
			w.WriteHeader(500)
			log.Error("Cannot upgrade to websocket", "err", err)
			return
		}
		if err := conn.Close(); err != nil {
			log.Error("Cannot close websocket", "err", err)
		}
	}

	<-ctx.Done()
}

func checkSubprotocol(protocols []string) bool {
	for _, protocol := range protocols {
		if protocol == "ocpp1.6" {
			return true
		}
	}
	return false
}
