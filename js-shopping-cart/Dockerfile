FROM node:12.16.3-buster-slim
# Copy and install deps. This is done as a separate step as an optimization, so changes to the programs files
# don't require the npm install to be redone
RUN mkdir -p /opt/samples/js-shopping-cart
RUN mkdir -p /opt/samples/js-shopping-cart/protocols/example
#COPY node-support /opt/node-support
COPY package.json /opt/samples/js-shopping-cart/
RUN cd /opt/samples/js-shopping-cart && npm install
# Now copy the entire app
COPY . /opt/samples/js-shopping-cart
WORKDIR /opt/samples/js-shopping-cart
#RUN npm run prestart  # CA - TODO: this is giving a proto problem (will circle back to deal)
# run
EXPOSE 8080
CMD ["npm", "run", "start-no-prestart"]
