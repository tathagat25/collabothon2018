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
    existing_product: document.getElementById('existing_product'),
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
    var product_id = url.searchParams.get("product_id");
    app.product_id = product_id;
    
    var div = document.createElement("div");
    database.ref('/product/' + product_id).once('value').then(function(snapshot_product) {
      app.existing_product.innerHTML = "Here you can find immediately avaiable products for replacement of your " + snapshot_product.val().name;
    });
    
    app.existing_product.appendChild(div);
  };
  

  app.init();

  // TODO add service worker code here
})();
