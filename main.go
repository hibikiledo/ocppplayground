package main

import (
	"log/slog"
	"net/http"
	"ocppplayground/cs"
	"ocppplayground/ocpp1_6"
	"os"
)

func main() {
	logger := slog.New(slog.NewJSONHandler(os.Stderr, &slog.HandlerOptions{}))
	slog.SetDefault(logger)

	http.HandleFunc("/ocppj/cp/{identity}", ocpp1_6.UpgradeToOcpp1_6)
	http.HandleFunc("/cs/{identity}", cs.UpgradeToWebsocket)

	http.ListenAndServe(":8888", nil)
}
