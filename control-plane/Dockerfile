FROM golang:1.21-alpine AS builder

WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download

COPY . .
RUN go build -o cp ./control-plane

FROM alpine:3.18
WORKDIR /app
COPY --from=builder /app/cp .

EXPOSE 8081
CMD ["./cp"]
