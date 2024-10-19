package ocpp1_6

import (
	"context"
	"fmt"
	"io"
	"log/slog"
	"net/http"
	"ocppplayground/ocpp1_6/message"
	"ocppplayground/ocpp1_6/parser"
	"ocppplayground/ocpp1_6/rpc"
	"strings"
	"time"

	"github.com/gorilla/websocket"
	"github.com/redis/go-redis/v9"
)

func HandleOcpp1_6(ctx context.Context, cpConn *websocket.Conn, cpIdentity string) {
	callFromCpCh := make(chan message.OcppCall)
	callResultFromCpCh := make(chan message.OcppCallResult)
	callErrorFromCpCh := make(chan message.OcppCallError)
	go receiveCpMessages(
		ctx,
		cpConn,
		callFromCpCh,
		callResultFromCpCh,
		callErrorFromCpCh,
	)

	callFromCsCh := make(chan message.OcppCall)
	callResultFromCsCh := make(chan message.OcppCallResult)
	callErrorFromCsCh := make(chan message.OcppCallError)
	go receiveCsMessages(
		ctx,
		cpIdentity,
		callFromCsCh,
		callResultFromCsCh,
		callErrorFromCsCh,
	)

	rdb := redis.NewClient(&redis.Options{
		Addr: "localhost:6380",
	})

	// Handle charge point initiated messages
	go func() {
		for {
			select {
			case cpCall := <-callFromCpCh:
				rdb.Publish(ctx, GetCpOutCpName(cpIdentity), cpCall.ToString())
			case csCallResult := <-callResultFromCsCh:
				err := cpConn.WriteMessage(websocket.TextMessage, []byte(csCallResult.ToString()))
				if err != nil {
					slog.Error("cannot write call result from cs to cp", "err", err)
					ctx.Done()
					return
				}
			case csCallError := <-callErrorFromCsCh:
				err := cpConn.WriteMessage(websocket.TextMessage, []byte(csCallError.ToString()))
				if err != nil {
					slog.Error("cannot write call error from cs to cp", "err", err)
					ctx.Done()
					return
				}
			case <-ctx.Done():
				return
			}
		}
	}()

	// Handle central system initiated messages
	go func() {
		rpc := rpc.Rpc{
			Conn: cpConn,
		}

		for {
			csCall := <-callFromCsCh
			rpc.Send(&csCall)
			select {
			case cpCallResult := <-callResultFromCpCh:
				err := rpc.RecvResult(&cpCallResult)
				if err != nil {
					// TODO: reset charge point
				}
				rdb.Publish(ctx, GetCpOutCpName(cpIdentity), cpCallResult.ToString())
			case cpCallError := <-callErrorFromCpCh:
				err := rpc.RecvError(&cpCallError)
				if err != nil {
					// TODO: reset charge point
				}
				rdb.Publish(ctx, GetCpOutCpName(cpIdentity), cpCallError.ToString())
			case <-time.After(30 * time.Second):
				slog.Error("Timeout waiting for RPC response")
				ctx.Done()
			}
		}
	}()

	<-ctx.Done()
	if err := cpConn.Close(); err != nil {
		slog.Error("Failed to close websocket connection")
	}

	close(callFromCpCh)
	close(callResultFromCpCh)
	close(callErrorFromCpCh)
	close(callFromCsCh)
	close(callResultFromCsCh)
	close(callErrorFromCsCh)
}

func receiveCpMessages(
	ctx context.Context,
	conn *websocket.Conn,
	callCh chan message.OcppCall,
	callResultCh chan message.OcppCallResult,
	callErrorCh chan message.OcppCallError,
) {
	for {
		messageType, p, err := conn.ReadMessage()
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
			callCh <- ocppCall
		}

		if ocppCallResult, ok := result.(message.OcppCallResult); ok {
			callResultCh <- ocppCallResult
		}

		if ocppCallError, ok := result.(message.OcppCallError); ok {
			callErrorCh <- ocppCallError
		}
	}
}

func receiveCsMessages(
	ctx context.Context,
	cpIdentity string,
	callFromCsCh chan message.OcppCall,
	callResultFromCsCh chan message.OcppCallResult,
	callErrorFromCsCh chan message.OcppCallError,
) {
	rdb := redis.NewClient(&redis.Options{
		Addr: "localhost:6380",
	})

	cpInChName := GetCpInChName(cpIdentity)
	sub := rdb.Subscribe(ctx, cpInChName)
	defer sub.Close()

	ch := sub.Channel()
	go func() {
		for {
			select {
			case msg := <-ch:
				msgBytes := []byte(msg.Payload)
				result, err := parser.Parse(&msgBytes)
				if err != nil {
					slog.Error("Failed to parse bytes into an OCPP message", "err", err)
					continue
				}

				if ocppCall, ok := result.(message.OcppCall); ok {
					callFromCsCh <- ocppCall
				}

				if ocppCallResult, ok := result.(message.OcppCallResult); ok {
					callResultFromCsCh <- ocppCallResult
				}

				if ocppCallError, ok := result.(message.OcppCallError); ok {
					callErrorFromCsCh <- ocppCallError
				}
			case <-ctx.Done():
				return
			}
		}
	}()

	<-ctx.Done()
}

func processCall(cpIdentity string, m *message.OcppCall) []byte {
	mStr := m.ToString()
	res, err := http.Post(
		fmt.Sprintf("http://localhost:3001/ocppj1.6/%s", cpIdentity),
		"application/json",
		strings.NewReader(mStr))
	if err != nil {
		ocppCallError := message.OcppCallError{
			UniqueId:         m.UniqueId,
			ErrorCode:        "Internal Error",
			ErrorDescription: err.Error(),
			ErrorDetails:     "{}",
		}
		return []byte(ocppCallError.ToString())
	}
	defer res.Body.Close()

	resBody, err := io.ReadAll(res.Body)
	if err != nil {
		ocppCallError := message.OcppCallError{
			UniqueId:         m.UniqueId,
			ErrorCode:        "Internal Error",
			ErrorDescription: err.Error(),
			ErrorDetails:     "{}",
		}
		return []byte(ocppCallError.ToString())
	}
	return resBody
}
