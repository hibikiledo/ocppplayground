package cs

import (
	"context"
	"log/slog"
	"ocppplayground/ocpp1_6"
	"ocppplayground/ocpp1_6/message"
	"ocppplayground/ocpp1_6/parser"
	"os"

	"github.com/gorilla/websocket"
	"github.com/redis/go-redis/v9"
)

func HandleCs(ctx context.Context, csConn *websocket.Conn, cpIdentity string) {
	rdbConOpts, _ := redis.ParseURL(os.Getenv("REDIS_CONNECTION_STRING"))
	rdb := redis.NewClient(rdbConOpts)

	cpInChName := ocpp1_6.GetCpInChName(cpIdentity)
	cpOutChName := ocpp1_6.GetCpOutCpName(cpIdentity)

	sub := rdb.Subscribe(ctx, cpInChName, cpOutChName)
	ch := sub.Channel()

	go func() {
		for msg := range ch {
			switch msg.Channel {
			case cpInChName:
				err := csConn.WriteMessage(
					websocket.TextMessage,
					[]byte("i"+msg.Payload),
				)
				if err != nil {
					slog.Error("Cannot write message from cpInCh to websocket", "err", err)
					ctx.Done()
					return
				}
			case cpOutChName:
				err := csConn.WriteMessage(
					websocket.TextMessage,
					[]byte("o"+msg.Payload),
				)
				if err != nil {
					slog.Error("Cannot write message from cpOutCh to websocket", "err", err)
					ctx.Done()
					return
				}
			}
		}
	}()

	go func() {
		for {
			messageType, p, err := csConn.ReadMessage()
			if err != nil {
				slog.Error("Error read message.", "err", err)
				ctx.Done()
				return
			}

			if messageType == websocket.BinaryMessage {
				slog.Warn("Received binary message from websocket. Unsupported.")
				ctx.Done()
				return
			}

			result, err := parser.Parse(&p)
			if err != nil {
				slog.Error("Failed to parse bytes into an OCPP message", "err", err)
				ctx.Done()
				return
			}

			if ocppCall, ok := result.(message.OcppCall); ok {
				rdb.Publish(ctx, cpInChName, ocppCall.ToString())
			}

			if ocppCallResult, ok := result.(message.OcppCallResult); ok {
				rdb.Publish(ctx, cpInChName, ocppCallResult.ToString())
			}

			if ocppCallError, ok := result.(message.OcppCallError); ok {
				rdb.Publish(ctx, cpInChName, ocppCallError.ToString())
			}
		}
	}()

	<-ctx.Done()
	err := csConn.Close()
	if err != nil {
		slog.Error("Cannot close websocket", "err", err)
	}
}
