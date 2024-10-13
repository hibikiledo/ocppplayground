package ocpp1_6

import "fmt"

func GetCpInChName(cpIdentifier string) string {
	return fmt.Sprintf("cp:%s/in", cpIdentifier)
}

func GetCpOutCpName(cpIdentifier string) string {
	return fmt.Sprintf("cp:%s/out", cpIdentifier)
}
