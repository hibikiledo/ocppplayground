package cs

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
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

func UpgradeToWebsocket(w http.ResponseWriter, req *http.Request) {
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

	conn, err := upgrader.Upgrade(w, req, http.Header{})
	if err != nil {
		w.WriteHeader(500)
		log.Error("Cannot upgrade to websocket", "err", err)
		return
	}
	go HandleCs(ctx, conn, cpIdentity)

	<-ctx.Done()
}
