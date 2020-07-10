
# Cloudstate Sample Shopping Cart Application

## Prerequisites

* [Your Lightbend Cloudstate Account](https://docs.lbcs.io/gettingstarted/account.html)
* Install [csctl](https://docs.lbcs.io/getting-started/set-up-development-env.html)

## Deploying to Lightbend CloudState

The following steps use `csctl` to deploy both the [shopping-cart frontend
service](https://github.com/cloudstateio/samples-ui-shoppingcart) and the
CloudState shopping-cart service defined in this repo. We'll be using the
pre-built Docker images for the frontend and the shopping-cart, but feel free to
build and use your own Docker images where appropriate.

### 1. Login

```shell
$ csctl auth login
```

### 2. Create a new project

```shell
$ csctl projects new sample-shopping-cart "Shopping Cart Sample"
```

### 3. List projects

```shell
$ csctl projects list
```

You should see the project listed:

```shell
  NAME                   DESCRIPTION            STATUS   ID
  sample-shopping-cart   Shopping Cart Sample   active   39ad1d96-466a-4d07-b826-b30509bda21b
```

Wait until you receive an email approving your project!

### 4. Set the current project

```shell
$ export CSCTL_CURRENT_PROJECT=`csctl projects list -o json | \
  jq -r '.[] | select(.friendly_name == "sample-shopping-cart") | .name / "/" | .[1]'`
$ csctl config set project $CSCTL_CURRENT_PROJECT
```

### 5. Deploy the frontend

```shell
$ csctl deploy frontend lightbend-docker-registry.bintray.io/cloudstate-samples/frontend
```

### 6. Create the store

```shell
$ csctl store deploy shopping-store
```

Wait for the store to be created

```shell
$ watch csctl stores get
```

Proceed when `STATUS` is `ready`, this can take some time.

### 7. Deploying the shopping-cart service

```shell
$ csctl deploy \
    shopping-cart \
    lightbend-docker-registry.bintray.io/cloudstate-samples/shopping-cart \
    --with-store shopping-store
```

Wait for the shopping cart service `STATUS` to be `ready`.

```shell
$ watch csctl svc get

```

### 8. Expose the frontend service

```shell
$ csctl svc expose frontend
```

The output will look like this:

```shell
Service 'frontend' was successfully exposed at: small-fire-5330.us-east1.apps.lbcs.io
```

Make a note of the hostname since it will be used to expose other services on the same host.

### 9. Expose the shopping-cart service

```shell
$ csctl svc expose shopping-cart \
  --hostname small-fire-5330.us-east1.apps.lbcs.io \
  --uri-prefix=/com.example.shoppingcart.ShoppingCart/
```

### 10. Visit the deployed shopping-cart frontend

The sample shopping cart is live. The frontend lives on the hostname previously
generated when deploying the frontend. Append `/pages/index.html` to the
provided hostname to see the shopping-cart frontend.

In the example above, the URL would be:
```
https://small-fire-5330.us-east1.apps.lbcs.io/pages/index.html
```

## Building the Docker image

```shell
$ cd shopping-cart
$ docker build -t <username>/shopping-cart .
$ docker push <username>/shopping-cart
```

Use your image in place of the
lightbend-docker-registry.bintray.io/cloudstate-samples/shopping-cart
in step 7.

## Deploying to Kubernetes + CloudState

If you're self-hosting CloudState, the instructions for deploying the sample
shopping cart application are in the
[`deploy` directory](https://github.com/cloudstateio/samples-js-shoppingcart/blob/master/deploy/README.md)

## Local Development

### Prerequisites

The following assumes that you have completed the steps for setting up your local environment as well as creating an account and project.  If you have not done this you must follow the instructions here:

* Install [nvm](https://github.com/nvm-sh/nvm#install--update-script) (node version manager)
  * We recommend v0.34.0 or later.  (Check with `nvm --version`)
* You also need to install the protobuf compiler.
  * We recommend using v3.0.0 or later.  (Check with `protoc --version`)
  * Mac OS X `brew install protobuf`
  * Linux `sudo apt install protobuf-compiler`
  * Or [alternatively](https://developers.google.com/protocol-buffers/docs/downloads) (src and bins)

## Maintenance notes

### License

The license is Apache 2.0, see [LICENSE](LICENSE).

### Maintained by

__This project is NOT supported under the Lightbend subscription.__

This project is maintained mostly by @coreyauger and @cloudstateio.

Feel free to ping the maintainers above for code review or discussions. Pull requests are very welcome–thanks in advance!

### Disclaimer

[DISCLAIMER.txt](DISCLAIMER.txt)
