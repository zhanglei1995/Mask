FROM node:7.5.0

RUN apt-get update; \
    apt-get install -y --no-install-recommends apt-transport-https; \
    curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | apt-key add -; \
    echo "deb https://dl.yarnpkg.com/debian/ stable main" | tee /etc/apt/sources.list.d/yarn.list; \
    apt-get update; \
    apt-get install -y --no-install-recommends \
            yarn \
    ; \
    rm -rf /var/lib/apt/lists/*

RUN mkdir -p /usr/src/app

ARG NODE_ENV
ENV NODE_ENV $NODE_ENV
COPY . /usr/src/app
WORKDIR /usr/src/app
RUN yarn install && yarn cache clean && yarn run make

CMD [ "yarn", "start" ]
