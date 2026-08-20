FROM node:20-alpine AS builder

WORKDIR /app

# Accept build arg
ARG REACT_APP_API_URL=http://localhost:8080
# ARG REACT_APP_API_URL=https://skidmore-dhall-back.us.reclaim.cloud

# Set as environment variable for build
ENV REACT_APP_API_URL=$REACT_APP_API_URL

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

FROM nginx:alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf

COPY --from=builder /app/build /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]