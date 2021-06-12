
# Cloudstate Sample Shopping Cart Application

## Sample application structure

The sample application consists of two parts:
* A static html `frontend`
* A stateful entity-based service `shopping-cart`

## Building container images

All the latest container images are available publicly at `lightbend-docker-registry.bintray.io/cloudstate-samples`. Feel free to build your own images from sources.

### Frontend service

The `frontend` service is a web application written in TypeScript.
It compiles into static JavaScript, html and images. This web-app makes `grpc-web` calls directly to the `shopping-cart` services to get the data that it needs.

You can use our statically hosted page located here [https://static.akkaserverless.com/js-shopping-cart/index.html](https://static.akkaserverless.com/js-shopping-cart/index.html)

This page will ask you for your exposed `shopping-cart` service hostname.  The page then makes `grpc-web` calls against that hostname.

Alternatively, you can clone the [cloudstateio/samples-ui-shoppingcart](https://github.com/cloudstateio/samples-ui-shoppingcart) repository and follow the instructions there to build and deploy to your own hosting provider.

### Shopping cart service

You can use the pre-built `lightbend-docker-registry.bintray.io/cloudstate-samples/shopping-cart-js:latest` container image.

Alternatively, you can build an image from the sources in the `shopping-cart` directory and push it to your own container image repository.

```shell
$ cd shopping-cart
$ docker build -t <username>/shopping-cart .
$ docker push <username>/shopping-cart
```

## Deploying to Akka Serverless

The following steps use `akkasls` to deploy the application to [Akka Serverless](https://docs.cloudstate.com/).

If you're self-hosting Cloudstate, the instructions for deploying the sample shopping cart application are in the [`deploy` directory](./deploy/README.md)

### Prerequisites

* Get [Your Akka Serverless Account](https://docs.cloudstate.com/getting-started/lightbend-account.html)
* Install [akkasls](https://docs.cloudstate.com/getting-started/set-up-development-env.html)

### Login to Akka Serverless

```shell
$ akkasls auth login
```

### Create a new project

```shell
$ akkasls projects new sample-shopping-cart "Shopping Cart Sample"
```

Wait until you receive an email approving your project!

List projects:

```shell
$ akkasls projects list
```

You should see the project listed:

```shell
  NAME                   DESCRIPTION            STATUS   ID
  sample-shopping-cart   Shopping Cart Sample   active   39ad1d96-466a-4d07-b826-b30509bda21b
```

You can change the current project:

```shell
$ akkasls config set project sample-shopping-cart
```

### Deploying the shopping cart service

A pre-built container image of the shopping cart service is provided as `lightbend-docker-registry.bintray.io/cloudstate-samples/shopping-cart-js`.
If you have built your own container image, change the image in the following command to point to the one that you just pushed.

```shell
$ akkasls svc deploy \
    shopping-cart \
    lightbend-docker-registry.bintray.io/cloudstate-samples/shopping-cart-js
```

Wait for the shopping cart service `STATUS` to be `ready`.

```shell
$ akkasls svc get
```

### Expose the shopping-cart service

```shell
$ akkasls svc expose shopping-cart --enable-cors
```

The output will look like this:

```shell
Service 'shopping-cart' was successfully exposed at: small-fire-5330.us-east1.apps.lbcs.io
```

Make a note of the hostname since it will be used by the `frontend` static html page.

### Visit the shopping-cart web frontend

Open a browser and go to the following url: [https://static.cloudstate.com/js-shopping-cart/index.html](https://static.cloudstate.com/js-shopping-cart/index.html)

Once the page has loaded your will see a dialog prompting you to enter the hostname for your exposed (and CORS enabled) `shopping-cart` service.

In the example above, the hostname would be:
```
small-fire-5330.us-east1.apps.lbcs.io
```

## Local Development

### Prerequisites

* Install [nvm](https://github.com/nvm-sh/nvm#install--update-script) (node version manager)
  * We recommend v0.34.0 or later.  (Check with `nvm --version`)

### Installing dependencies

```shell
$ nvm install
$ nvm use
$ npm install
```

### Running tests

```shell
$ npm test
```

## Maintenance notes

### License

The license is Apache 2.0, see [LICENSE](LICENSE).

### Maintained by

__This project is NOT supported under the Lightbend subscription.__

This project is maintained mostly by @coreyauger and @cloudstateio.

Feel free to ping the maintainers above for code review or discussions. Pull requests are very welcome.  Thanks in advance!

### Disclaimer

[DISCLAIMER.txt](DISCLAIMER.txt)
