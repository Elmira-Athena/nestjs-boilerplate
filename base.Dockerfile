FROM node:22-alpine AS base
WORKDIR /app
COPY package*.json /app

FROM base AS dependencies
RUN npm install

FROM dependencies AS build
COPY . /app
