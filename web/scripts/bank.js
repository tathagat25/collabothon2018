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
    existing_product: document.querySelector('.existing_product'),
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
    
    var url = new URL(window.location.href);
    var user_id = url.searchParams.get("user_id");
    var price = url.searchParams.get("price");
    
    console.log(user_id);
    console.log(price);
    
    document.querySelector('.price').textContent = price;
    
    var balance = 5000;
    
    // database.ref('/users/' + user_id).once('value').then(function(snapshot) {
//       if (snapshot.val()) {
//         console.log(snapshot.val().account);
//         $.ajax({
//           type:'GET',
//           url: 'https://api-sandbox.commerzbank.com/accounts-api/v1-s/accounts',
//           header: {'keyid':'ad93ca8a-eba7-48af-b039-647159e6ff29'},
//           crossDomain: true,
//           dataType: 'jsonp',
//           beforeSend: function(xhr) {
//             xhr.setRequestHeader("keyid", "ad93ca8a-eba7-48af-b039-647159e6ff29");
//             //xhr.setRequestHeader("Allow-Control-Allow-Origin", "*");
//           },
//           success: function(data){
//             alert(data);
//             //process the JSON data etc
//           }
//         });
//       }
//     });
    document.querySelector('.balance').textContent = balance;
    
  };
  

  app.init();

  // TODO add service worker code here
})();
