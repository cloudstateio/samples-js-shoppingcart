
# Deploying to Kubernetes with Cloudstate

## Prerequisites

[Run Cloudstate](https://github.com/cloudstateio/cloudstate#run-cloudstate) in your Kubernetes cluster.

## Quick install

All the latest docker images are available publicly at `lightbend-docker-registry.bintray.io/cloudstate-samples`.

To deploy the shopping-cart application as is, connect to your kubernetes environment and do the following.

```bash
$ cd deploy
$ kubectl apply -f . -n <project-name>
# verify stateful store
$ kubectl get -n <project-name> statefulstore
NAME                  AGE
shopping-store   21m
# verify stateful services
$ kubectl -n <project-name>  get statefulservices
NAME            AGE    REPLICAS   STATUS
shopping-cart   7m     1          Running
frontend        4m     1          Running
```

## Building and deploying the sample shopping cart application

### Frontend Service

The `frontend` service is a frontend web application written in TypeScript. It is backed by a `stateless` service that will serve the compiled JavaScript, html and images. This service makes `grpc-web` calls directly to the other services to get the data that it needs.

#### Getting container image ready

You can use the pre-built `lightbend-docker-registry.bintray.io/cloudstate-samples/frontend:latest` container image available at Lightbend Cloudstate samples repository.

Alternatively, you can clone the [cloudstateio/samples-ui-shoppingcart](https://github.com/cloudstateio/samples-ui-shoppingcart) repository and follow the instructions there to build an image and deploy it to your own container image repository.

#### Deploying the frontend service

If you have built your own container image, edit the `frontend.yaml` to point to the image that you just pushed.

```bash
$ cat frontend.yaml
apiVersion: cloudstate.io/v1alpha1
kind: StatefulService
metadata:
  name: frontend
spec:
  containers:
  - image: lightbend-docker-registry.bintray.io/cloudstate-samples/shopping-cart-js:latest # <-- Change this to your repo/image
    name: frontend
```

Deploy the service to your project namespace

```bash
$ kubectl apply -f frontend.yaml -n <project_name>
statefulservice.cloudstate.io/frontend created
```

### Stateful Store

The shopping cart stateful service relies on a stateful store as defined in `shopping-store.yaml`.

Deploy the store to your project namespace

```bash
$ kubectl apply -f shopping-store.yaml -n <project-name>
statefulstore.cloudstate.io/shopping-store created
```

### Shopping Cart Service

```bash
$ cd ../shopping-cart
```

#### Installing development dependencies (optional)

Although this is not required for building and deploying the service, you might want to set up development environment

```bash
$ nvm install
$ nvm use
$ npm install
```

After that you can run tests

```bash
$ npm test
```

#### Building a container image

Build a docker image with the right registry and tag

NOTE: you can get a free public docker registry by signing up at [https://hub.docker.com](https://hub.docker.com/)

```bash
$ docker build . -t <my-registry>/shopping-cart:latest
```

Push the docker image to the registry

```bash
$ docker push <my-registry>/shopping-cart:latest
```

#### Deploying the service

Deploy the image by changing into the deploy folder and editing `shopping-cart.yaml` to point to the docker image that you just pushed.

```bash
$ cd ../deploy
$ cat shopping-cart.yaml
apiVersion: cloudstate.io/v1alpha1
kind: StatefulService
metadata:
  name: shopping-cart
spec:
  # Datastore configuration
  storeConfig:
    database: shopping
    statefulStore:
      # Name of a deployed Datastore to use.
      name: shopping-store
  containers:
    - image:  lightbend-docker-registry.bintray.io/cloudstate-samples/frontend:latest # <-- Change this to your repo/image
      name: shopping-cart
```

Deploy the service to your project namespace

```bash
$ kubectl apply -f shopping-cart.yaml -n <project-name>
statefulservice.cloudstate.io/shopping-cart created
```

### Verify they are running

Check that the services are running

```bash
$ kubectl get statefulservices -n <project-name>
NAME            AGE    REPLICAS   STATUS
shopping-cart   6m     1          Running
frontend        3m     1          Running
```

To redeploy a new image to the cluster you must delete and then redeploy using the yaml file.  
For example, if we updated the shopping-cart docker image we would do the following.

```bash
$ kubectl delete statefulservice shopping-cart -n <project-name>
statefulservice.cloudstate.io "shopping-cart" deleted
$ kubectl apply -f shopping-cart.yaml -n <project-name>
statefulservice.cloudstate.io/shopping-cart created
```

## Routes

The last thing that is required, is to provide the public routes needed for both the frontend and grpc-web calls.  These exist in the `routes.yaml` file.

```bash
$ cat routes.yaml
apiVersion: cloudstate.io/v1alpha1
kind: Route
metadata:
  name: "shopping-routes"
spec:
  http:
  - name: "shopping-routes"
    match:
    - uri:
        prefix: "/com.example.shoppingcart.ShoppingCart/"
    route:
      service: shopping-cart
  - name: "frontend-routes"
    match:
    - uri:
        prefix: "/"
    route:
      service: frontend
```

Add these routes by performing

```bash
kubectl apply -f routes.yaml -n <project-name>
```
