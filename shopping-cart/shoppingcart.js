/*
 * Copyright 2019 Lightbend Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

const EventSourced = require("cloudstate").EventSourced;

const entity = new EventSourced(
  ["shoppingcart.proto", "domain.proto"],
  "com.example.shoppingcart.ShoppingCart",
  {
    persistenceId: "shopping-cart",
    snapshotEvery: 5, // Usually you wouldn't snapshot this frequently, but this helps to demonstrate snapshotting
    includeDirs: ["./"],
    serializeFallbackToJson: true // Enables JSON support for persistence
  }
);

/*
 * Set a callback to create the initial state. This is what is created if there is no
 * snapshot to load.
 *
 * We can ignore the userId parameter if we want, it's the id of the entity, which is
 * automatically associated with all events and state for this entity.
 */
entity.setInitial(userId => ({items: []}));

/*
 * Set a callback to create the behavior given the current state. Since there is no state
 * machine like behavior transitions for our shopping cart, we just return one behavior, but
 * this could inspect the cart, and return a different set of handlers depending on the
 * current state of the cart - for example, if the cart supported being checked out, then
 * if the cart was checked out, it might return AddItem and RemoveItem command handlers that
 * always fail because the cart is checked out.
 *
 * This callback will be invoked after each time that an event is handled to get the current
 * behavior for the current state.
 */
entity.setBehavior(cart => {
  return {
    // Command handlers. The name of the command corresponds to the name of the rpc call in
    // the gRPC service that this entity offers.
    commandHandlers: {
      AddItem: addItem,
      RemoveItem: removeItem,
      GetCart: getCart
    },
    // Event handlers. The name of the event corresponds to the value of the
    // type field in the event JSON.
    eventHandlers: {
      ItemAdded: itemAdded,
      ItemRemoved: itemRemoved
    }
  };
});

/**
 * Handler for add item commands.
 */
function addItem(addItem, cart, ctx) {
  console.log("addItem", addItem);
  // Validation:
  // Make sure that it is not possible to add negative quantities
  if (addItem.quantity < 1) {
    console.log("addItem:: quantity check failed")
    ctx.fail("Cannot add negative quantity to item " + addItem.productId);
  } else {
  // Create the event.    
    const itemAdded = {
      type: "ItemAdded",
      item: {
        productId: addItem.productId,
        name: addItem.name,
        quantity: addItem.quantity
      }
    };
    // Emit the event.
    console.log("addItem::emit event", itemAdded);
    ctx.emit(itemAdded);
    return {};
  }
}

/**
 * Handler for remove item commands.
 */
function removeItem(removeItem, cart, ctx) {
  console.log("removeItem", removeItem);
  // Validation:
  // Check that the item that we're removing actually exists.
  const existing = cart.items.find(item => {
    console.log("removeItem:: return existing");
    return item.productId === removeItem.productId;
  });

  // If not, fail the command.
  if (!existing) {
    ctx.fail("Item " + removeItem.productId + " not in cart");
  } else {
    // Otherwise, emit an item removed event.
    const itemRemoved = {
      type: "ItemRemoved",
      productId: removeItem.productId
    };
    ctx.emit(itemRemoved);
    return {};
  }
}

/**
 * Handler for get cart commands.
 */
function getCart(request, cart) {
  console.log("getCart", cart);
  // Simply return the shopping cart as is.
  return cart;
}

/**
 * Handler for item added events.
 */
function itemAdded(added, cart) {
  console.log("itemAdded");
  // If there is an existing item with that product id, we need to increment its quantity.
  const existing = cart.items.find(item => {
    console.log("itemAdded::return existing");
    return item.productId === added.item.productId;
  });

  if (existing) {
    existing.quantity = existing.quantity + added.item.quantity;
  } else {
    console.log("itemAdded::push");
    // Otherwise, we just add the item to the existing list.
    cart.items.push(added.item);
  }

  // And return the new state.
  console.log("return state");
  return cart;
}

/**
 * Handler for item removed events.
 */
function itemRemoved(removed, cart) {
  // Filter the removed item from the items by product id.
  cart.items = cart.items.filter(item => {
    return item.productId !== removed.productId;
  });

  // And return the new state.
  return cart;
}

// Export the entity
module.exports = entity;
