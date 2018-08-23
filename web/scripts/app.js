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

  /*****************************************************************************
   *
   * Methods to update/refresh the UI
   *
   ****************************************************************************/
    app.startML = function(product) {
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

  };

  firebase.auth().onAuthStateChanged(function(user) {
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
      database.ref('/users/' + userId).once('value').then(function(snapshot) {
        if (snapshot.val()) {
          database.ref('users/' + userId).update({
            last_login_timestamp: Date.now()
          });
          
        } else {
          database.ref('users/' + userId).set({
            name: user.displayName,
            email: user.email,
            register_timestamp: Date.now(),
          });
        }
        
        // User is successfully logged in
        app.mainDiv.removeAttribute('hidden');
        
        //start the ML on user's products
        database.ref('registered_machines/' + userId).on('value', function(snapshot) {
          while (app.productsTable.firstChild) {
              app.productsTable.removeChild(app.productsTable.firstChild);
          }
          
          snapshot.forEach(function(childSnapshot) {
            // extend the table
            database.ref('/product/' + childSnapshot.val().product_id).once('value').then(function(snapshot) {
              if (snapshot.val()) {
                console.log(snapshot.val());
                var newDiv = document.createElement("div");
                var manufacturer = document.createTextNode(snapshot.val().manufacturer);
                var name = document.createTextNode(snapshot.val().name);
                var status = childSnapshot.val().status;
                var daysForNextAlert = document.createTextNode("Next Alert in " + childSnapshot.val().days_until_next_alert + " days ");

                newDiv.appendChild(name);
                newDiv.appendChild(document.createElement("br"));
                newDiv.appendChild(manufacturer);

                if ("ok" == status) {
                   newDiv.classList.add("status_green");
                   newDiv.appendChild(document.createElement("br"));
                   newDiv.appendChild(daysForNextAlert);
                   newDiv.appendChild(document.createElement("br"));
                }
                else if ("broken" == status){
                   newDiv.classList.add("status_red");

                   newDiv.appendChild(document.createElement("br"));
                   var inspection_comment = document.createTextNode("Inspection comment: " + childSnapshot.val().inspection_comment);
                   newDiv.appendChild(inspection_comment);

                   var buyNew = document.createElement("BUTTON");
                   var buyNewText = document.createTextNode("Buy New");

                   buyNew.appendChild(buyNewText);

                   newDiv.appendChild(document.createElement("br"));
                   newDiv.appendChild(document.createTextNode("Product broken"));
                   newDiv.appendChild(document.createElement("br"));
                   newDiv.appendChild(buyNew);
                }
                else {
                   newDiv.classList.add("status_orange");
                   var technicalCheckAppointment = document.createElement("BUTTON");
                   var technicalCheckAppointmentText = document.createTextNode("Technical Check");
                   technicalCheckAppointment.appendChild(technicalCheckAppointmentText);
                   technicalCheckAppointment.addEventListener("click", function(e) {
                       window.location.replace("techniker_schedule.html?customer_id=" +
                        userId + "&registered_machine_id=" + childSnapshot.val().product_id + "");
                   });

                   newDiv.appendChild(document.createElement("br"));
                   newDiv.appendChild(technicalCheckAppointment);
                }

                newDiv.classList.add("row-full");
                app.productsTable.appendChild(newDiv);
              }
            });

             app.productsTable.appendChild(document.createElement("br"));
          });
        });
      });

  //check for products that need to be checked
  
        database.ref('registered_machines/' + userId).once('value', function(snapshot) {
          snapshot.forEach(function(childSnapshot) {
      if (childSnapshot.val().status == "alarm") {
        //send a push notification to warn about a needed checkup
		var registered_machine_id = childSnapshot.key
        var productId = childSnapshot.val().product_id;
        database.ref('product/' + productId).once('value').then(function(product){
          Push.create("Warning!", {
          body: "Your " + product.val().name + " needs a checkup.",
          icon: 'images/warn.jpg',
          onClick: function () {
            window.focus();
            window.open("fixproduct.html?registered_machine_id="+registered_machine_id,"_self");
            this.close();
          }
          });
        });
      }
})});
      
      document.getElementById('user-signed-in').style.display = 'block';
      document.getElementById('user-signed-out').style.display = 'none';
      document.getElementById('sign-out').style.display = 'block';
      
      //console.log("User is signed in");
    } else {
      // User is signed out.
      //console.log("User is signed out");
      app.headerTitle.textContent = "The Machine Men";

      app.mainDiv.setAttribute('hidden', true);

      document.getElementById('user-signed-in').style.display = 'none';
      document.getElementById('user-signed-out').style.display = 'block';
      document.getElementById('sign-out').style.display = 'none';
    }
  });

  app.init();

  // TODO add service worker code here
})();
