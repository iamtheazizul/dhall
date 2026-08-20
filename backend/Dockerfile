FROM golang:1.24-alpine AS builder

WORKDIR /app

# Copy everything first (including data package)
COPY . .

# Then download dependencies
RUN go mod download

# Build
RUN CGO_ENABLED=0 GOOS=linux go build -o main .

FROM alpine:latest

RUN apk --no-cache add ca-certificates

RUN apk add --no-cache tzdata

WORKDIR /app

COPY --from=builder /app/main .

RUN mkdir -p /app/data

COPY data /app/data

EXPOSE 8080

CMD ["./main"]
