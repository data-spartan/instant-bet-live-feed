# Base image
FROM node:18.18.0-alpine

# ARG ENV
# ENV NODE_ENV ${ENV}
# Create app directory
WORKDIR /usr/src

#in case error: EACCES: permission denied mkdir
RUN chown -R node:node /usr/src/ && mkdir -p usr/src/logs && chown -R node:node usr/src/logs

# RUN mkdir -p usr/src/logs && chown -R node:node usr/src/logs

COPY --chown=node:node package*.json ./

# Install app dependencies
RUN npm ci && npm cache clean --force

# Bundle app source
# COPY --chown=node:node . .
COPY . .
# RUN chown -R node /usr/src/app

# Creates a "dist" folder with the production build
RUN npm run build

USER node
# Start the server using the production build
CMD [ "node", "dist/apps/feed/main.js" ]
