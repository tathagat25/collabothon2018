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
    user: null,
    customer_id:null,
    registered_machine_id:null
  };


  /*****************************************************************************
   *
   * Event listeners for UI elements
   *
   ****************************************************************************/
  document.getElementById('sign-out').addEventListener('click', function() {
      firebase.auth().signOut();
    });
  

    document.getElementById('buttonMarkBroken').addEventListener('click', function() {
      var database = firebase.database();
      var comment = document.getElementById('techincal_comment').value;
      
      //alert(comment);
      
      database.ref('registered_machines/' + app.customer_id + '/' + app.registered_machine_id).update({
        status : "broken",
        inspection_comment: comment
      }, function(error) {
    if (error) {
      // The write failed...
    } else {
      window.location.replace("handyman.html");
    }
  });
    });


  /*****************************************************************************
   *
   * Methods to update/refresh the UI
   *
   ****************************************************************************/

  /*****************************************************************************
   *
   * Methods for dealing with the model
   *
   ****************************************************************************/


  // add startup code here
  app.init = function() {
    //console.log("BEGIN init");
    var database = firebase.database();
    app.mainDiv.removeAttribute('hidden');
    document.getElementById('user-signed-in').style.display = 'block';
    document.getElementById('user-signed-out').style.display = 'none';
    
    //alert(window.location.href);
    var url = new URL(window.location.href);
    var customer_id = url.searchParams.get("customer_id");
    app.customer_id = customer_id;
    var registered_machine_id = url.searchParams.get("registered_machine_id");
    app.registered_machine_id=registered_machine_id;
    console.log(customer_id);
    console.log(registered_machine_id);
    
    var div = document.createElement("div");
    div.classList.add("row-full");
    database.ref('/users/' + customer_id).once('value').then(function(snapshot_user) {
      div.innerHTML += "Customer Name: " + snapshot_user.val().name;
    });
    
    database.ref('/registered_machines/' + customer_id + '/' + registered_machine_id).once('value').then(function(snapshot_registered_device) {
      console.log(snapshot_registered_device.key);
      console.log(snapshot_registered_device.val());
      div.innerHTML += '</br>Install Date ' + snapshot_registered_device.val().install_date;
      
      
      database.ref('/product/' + snapshot_registered_device.val().product_id).once('value').then(function(snapshot_product) {
        div.innerHTML += "</br>Manufacturer: " + snapshot_product.val().manufacturer;
        div.innerHTML += "</br>Name: " + snapshot_product.val().name;
        div.innerHTML += "</br>Model Year: " + snapshot_product.val().model_year;
      });
    });
    
    app.productsTable.appendChild(div);
  };
  

  app.init();

  // TODO add service worker code here
})();
