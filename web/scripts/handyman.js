// Copyright 2016 Google Inc.
// 
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
// 
//      http://www.apache.org/licenses/LICENSE-2.0
// 
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.


(function() {
  'use strict';

  var app = {
    headerTitle: document.querySelector('.header__title'),
    totalCoffee: document.querySelector('.total__coffee'),
    mainDiv: document.querySelector('.main__div'),
    productsTable: document.querySelector('.products_table'),
    user: null
  };


  /*****************************************************************************
   *
   * Event listeners for UI elements
   *
   ****************************************************************************/
  document.getElementById('sign-out').addEventListener('click', function() {
      firebase.auth().signOut();
    });
  

  // TODO - refactor the below 2 methods
  /*document.getElementById('buttonSingleCoffee').addEventListener('click', function() {
    var database = firebase.database();
    var userId = app.user.uid;

    // Get a key for a new Post.
    var newKey = database.ref().child('coffees/' + userId).push().key;

    //console.log("Creating new single coffee %s", newKey);
    database.ref('coffees/' + userId + "/" + newKey).update({
      timestamp: Date.now(),
      type: 1
    });
    // also upddate the unpaid coffee count
    //console.log("Updating unpaid coffee count for user %s", userId);
    var newCount = 0;
    database.ref('/users/' + userId + "/unpaid_coffees_count").once('value').then(function(snapshot) {
      //console.log("Existing unpaid coffee count = %s for user %s", snapshot.val(), userId);
      newCount = snapshot.val() + 1;
      //console.log("New unpaid coffee count = %s for user %s", newCount, userId);
      database.ref('users/' + userId).update({
        unpaid_coffees_count : newCount
      });
    });
    alert("1 coffee added");
  });

  document.getElementById('buttonDoubleCoffee').addEventListener('click', function() {
    var database = firebase.database();
    var userId = app.user.uid;

    /// Get a key for a new Post.
    var newKey = database.ref().child('coffees/' + userId).push().key;

    //console.log("Creating new double coffee %s", newKey);
    database.ref('coffees/' + userId + "/" + newKey).update({
      timestamp: Date.now(),
      type: 2
    });
    // also upddate the unpaid coffee count
    //console.log("Updating unpaid coffee count for user %s", userId);
    var newCount = 0;
    database.ref('/users/' + userId + "/unpaid_coffees_count").once('value').then(function(snapshot) {
      //console.log("Existing unpaid coffee count = %s for user %s", snapshot.val(), userId);
      newCount = snapshot.val() + 2;
      //console.log("New unpaid coffee count = %s for user %s", newCount, userId);
      database.ref('users/' + userId).update({
        unpaid_coffees_count : newCount
      });
    });
    alert("2 coffees added");
  });*/


  /*****************************************************************************
   *
   * Methods to update/refresh the UI
   *
   ****************************************************************************/
    app.startML = function(product) {
      //console.log(product.product_id);
      // get the product info from product_id
      var database = firebase.database();
      database.ref('/product/' + product.product_id).once('value').then(function(snapshot) {
        if (snapshot.val()) {
          console.log(snapshot.val());
        }
      });
        
  }

  /*****************************************************************************
   *
   * Methods for dealing with the model
   *
   ****************************************************************************/


  // add startup code here
  app.init = function() {
    //console.log("BEGIN init");
    
    var ui = new firebaseui.auth.AuthUI(firebase.auth());
    ui.start('#firebaseui-auth-container', {
      callbacks: {
          signInSuccess: function(currentUser, credential, redirectUrl) {
            // User successfully signed in.
            // Return type determines whether we continue the redirect automatically
            // or whether we leave that to developer to handle.
            return true;
          },
          uiShown: function() {
            // The widget is rendered.
            // Hide the loader.
            document.getElementById('loader').style.display = 'none';
          }
        },
      signInOptions : [
        // List of OAuth providers supported.
        firebase.auth.GoogleAuthProvider.PROVIDER_ID
      ],
      signInSuccessUrl : "/index.html"
    });

    //console.log("END init");
  };

  firebase.auth().onAuthStateChanged(function(user) {
    //console.log("firing firebase.auth().onAuthStateChanged");
    if (user) {
      // User is signed in.
      var approved = false;
      var displayName = user.displayName;
      var email = user.email;
      var emailVerified = user.emailVerified;
      var photoURL = user.photoURL;
      var isAnonymous = user.isAnonymous;
      var uid = user.uid;
      var providerData = user.providerData;
      app.user = user;

      app.headerTitle.textContent = "Welcome " + displayName;
      
      // check if the user is already registered or a new user
      // TODO - refactor
      // Get a reference to the database service
      var database = firebase.database();
      var userId = user.uid;
      //console.log("Checking if %s is already registered", userId);
      database.ref('/users/' + userId).once('value').then(function(snapshot) {
        if (snapshot.val()) {
          //console.log("User %s is already registered", userId);
          database.ref('users/' + userId).update({
            last_login_timestamp: Date.now()
          });
          
        } else {
          //console.log("Creating User {}", userId);
          database.ref('users/' + userId).set({
            name: user.displayName,
            email: user.email,
            register_timestamp: Date.now(),
            //unpaid_coffees_count: 0
          });
        }
        
        // User is successfully logged in
        app.mainDiv.removeAttribute('hidden');
        
        // show the upcmoing appoitments/contracts of the handyman
        database.ref('handyman_machines/' + userId).once('value', function(snapshot) {
          snapshot.forEach(function(childSnapshot) {
            //console.log(childSnapshot.key);
            var div = document.createElement("div");
            var user_id;
            var registered_machine_id;
            var product_status;
            div.classList.add("status_orange");
            div.classList.add("row-full");
            // extend the table
            // database.ref('/product/' + childSnapshot.val().product_id).once('value').then(function(snapshot) {
//               if (snapshot.val()) {
//                 console.log(snapshot.val());
//                 div.textContent = snapshot.val().manufacturer;
//                 var status = snapshot.val().status;
//                 div.classList.add("status_red");
//
//               }
//             });
            database.ref('/users/' + childSnapshot.key).once('value').then(function(snapshot_user) {
              user_id = childSnapshot.key;
              div.textContent = "Customer Name: " + snapshot_user.val().name;
            });
            
            registered_machine_id = childSnapshot.val().registered_machine_id;
            
            database.ref('/registered_machines/' + childSnapshot.key + '/' + childSnapshot.val().registered_machine_id).once('value').then(function(snapshot_registered_device) {
              console.log(snapshot_registered_device.key);
              console.log(snapshot_registered_device.val());
              div.innerHTML += '</br>Install Date ' + snapshot_registered_device.val().install_date;
              product_status = snapshot_registered_device.val().status;
              
              
              database.ref('/product/' + snapshot_registered_device.val().product_id).once('value').then(function(snapshot_product) {
                div.innerHTML += "</br>Manufacturer: " + snapshot_product.val().manufacturer;
                div.innerHTML += "</br>Name: " + snapshot_product.val().name;
                div.innerHTML += "</br>Model Year: " + snapshot_product.val().model_year;
              });
              
              // only interested in products with status alarm
              console.log(product_status);
              if (product_status == "alarm") {
                app.productsTable.appendChild(div);
              }
            });
            
            div.addEventListener('click', function() {
              console.log(user_id + ":" + registered_machine_id);
              window.location.replace("handyman_customer_product.html?customer_id="+user_id+"&registered_machine_id="+registered_machine_id+"");
            });
            
            
            
            //app.productsTable
            //var childKey = childSnapshot.key;
            //var childData = childSnapshot.val();
            // app.startML(childSnapshot.val());
          });
        });
      });

      /*var unpaidCoffeeCount = database.ref('users/' + userId + '/unpaid_coffees_count');
      unpaidCoffeeCount.on('value', function(snapshot) {
        app.totalCoffee.textContent = snapshot.val();
      });*/
      
      document.getElementById('user-signed-in').style.display = 'block';
      document.getElementById('user-signed-out').style.display = 'none';
      
    } else {
      // User is signed out.
      //console.log("User is signed out");
      app.headerTitle.textContent = "The Machine Men";

      app.mainDiv.setAttribute('hidden', true);
      //app.totalCoffee.textContent = "";
      
      document.getElementById('user-signed-in').style.display = 'none';
      document.getElementById('user-signed-out').style.display = 'block';
    }
  });

  app.init();

  // TODO add service worker code here
})();
