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
    choose_date: document.querySelector('.choose_date'),
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

  // add startup code here
  app.init = function() {
    console.log("BEGIN init");
    var database = firebase.database();
    app.mainDiv.removeAttribute('hidden');
    document.getElementById('user-signed-in').style.display = 'block';
    document.getElementById('user-signed-out').style.display = 'none';

    var url = new URL(window.location.href);
    var customer_id = url.searchParams.get("customer_id");
    app.customer_id = customer_id;
    var registered_machine_id = url.searchParams.get("registered_machine_id");
    app.registered_machine_id=registered_machine_id;
    console.log("customer " + customer_id + " reg_machin " + registered_machine_id);
    console.log(registered_machine_id);

    console.log("begin div");

    var newDiv = document.createElement("div");

    var firstOption = document.createElement("BUTTON");
    var firstOptionLabel = "28.08.2018 14:00";
    var firstOptionText = document.createTextNode(firstOptionLabel);
    firstOption.appendChild(firstOptionText);

    var secondOption = document.createElement("BUTTON");
    var secondOptionLabel = "29.08.2018 14:00";
    var secondOptionText = document.createTextNode(secondOptionLabel);
    secondOption.appendChild(secondOptionText);

    var thirdOption = document.createElement("BUTTON");
    var thirdOptionLabel = "30.08.2018 09:00";
    var thirdOptionText = document.createTextNode(thirdOptionLabel);
    thirdOption.appendChild(thirdOptionText);

    newDiv.appendChild(firstOption);
    newDiv.appendChild(document.createElement("br"));
    newDiv.appendChild(document.createElement("br"));

    newDiv.appendChild(secondOption);
    newDiv.appendChild(document.createElement("br"));
    newDiv.appendChild(document.createElement("br"));
    newDiv.appendChild(thirdOption);

    firstOption.addEventListener("click", function(e) {
        updateRegisteredMachines(firstOptionLabel);
     });
    secondOption.addEventListener("click", function(e) {
            updateRegisteredMachines(secondOptionLabel);
         });
    thirdOption.addEventListener("click", function(e) {
            updateRegisteredMachines(thirdOptionLabel);
         });

     function updateRegisteredMachines(inspectionDate) {
          var database = firebase.database();
          database.ref('registered_machines/' + app.customer_id + '/' + app.registered_machine_id).update({
                          status : "technical_check_pending",
                          next_inspection_date : inspectionDate
                        }, function(error) {
                      if (error) {
                        console.log("Something went wrong while schedule technical check", error)
                      }
                    });

          database.ref('handyman_machines/xv7875KOapUlG70KwyMqpSQJWby1/' + app.customer_id).update({
                      registered_machine_id : app.registered_machine_id
                   }, function(e) {
          });

          window.location.replace("index.html");
     }

     app.choose_date.appendChild(newDiv);
  };

  app.init();

  // TODO add service worker code here
})();
