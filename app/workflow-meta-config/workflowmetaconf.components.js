(function() {
  'use strict';


  angular.module('app').component('workflowmetaconfig', {
    controller: WorkflowConfigController,
    //controllerAs: 'vm',
    templateUrl: 'app/workflow-meta-config/app.html'
  });

  angular.module('app').config(['$httpProvider', function($httpProvider) {
    $httpProvider.defaults.useXDomain = true;
    delete $httpProvider.defaults.headers.common['X-Requested-With'];
  }]);

  /* Custom Directive */
  angular.module('app').directive('requireMultiple', function () {
    return {
        require: 'ngModel',
        link: function postLink(scope, element, attrs, ngModel) {
            ngModel.$validators.required = function (value) {
                return angular.isArray(value) && value.length > 0;
            };
        }
    };
});


  /** @ngInject */
  function WorkflowConfigController($scope,$http, $timeout,toastr,$dialog,$rootScope) {

let getMetaDataChannels;
$scope.configdd = ['Premier Core', 'Clear Touch', 'Signature'];  //Connection type
$scope.availableclients = [];   //Available Connectivity type
$scope.selectedclients = [];    //Selected Connectivity type
$scope.ActualJSON = {};
$scope.NewConnectivityJSON = [];   //Conectivity type JSON
$scope.availableChannelName = [];  //Channe Name JSON
let getworkflowchannelname,
getnewconnectivityname
$scope.showsavebtn = true;

$scope.init = function(){
  $http.get("/getControllerServiceBaseUrl").then(function(response) {
    $scope.baseURL = response.data;
    console.log($scope.baseURL);
      }) .catch(function (data) {
        console.log(data);
        });

        var getbaseURL = localStorage.getItem("baseurl");
        console.log(getbaseURL);

        $http.get(getbaseURL + "/workflowMetaDataConfiguration").then(function(response) {
          // alert("Inside then");
           console.log(response.data);
           getMetaDataChannels = response.data.channels;
           $scope.getMetaDataConnectivityType = response.data.connectivityTypes;
        
           //getMetaDataConfigvalue = $scope.getMetaDataConfig;
           angular.forEach(getMetaDataChannels,function(value){
            var channelsarry = value.channelName;
            console.log(channelsarry);
            $scope.availableChannelName.push(channelsarry);
          });
        
          angular.forEach($scope.getMetaDataConnectivityType,function(value){
          var connectivityarry = value.connectionName;
          console.log(connectivityarry);
          $scope.availableclients.push({"connectionName":connectivityarry});
          });
        
         }) .catch(function (data) {
           console.log(data);
           //$scope.data.error=error;
                // console.log($scope.data.error.status); // Undefined!
           }); 
}







//get meta data for channels





$scope.addnewchannel = function(){

  if($scope.workflowchannelname == "" || $scope.workflowchannelname == undefined){
    return false;
  }else{
      getworkflowchannelname = $scope.workflowchannelname;
      // Uniqueness check
      if ($scope.availableChannelName.indexOf(getworkflowchannelname) == -1) {
        $scope.availableChannelName.push(getworkflowchannelname);
      console.log($scope.availableChannelName);
    }else{
   alert(getworkflowchannelname + " is already available. Try different Channel Name");
  }
}
  $scope.workflowchannelname = '';
}


$scope.addnewconnectivity = function(){
  if($scope.workflowcnnectivityname == "" || $scope.workflowcnnectivityname == undefined){
    return false;
  }else{
  getnewconnectivityname = $scope.workflowcnnectivityname;
  //$scope.availableclients.push(getnewconnectivityname);
  //console.log($scope.availableclients);
  $scope.NewConnectivityJSON.push({"connectionName":getnewconnectivityname});
  $scope.availableclients.push({"connectionName":getnewconnectivityname});
  console.log($scope.NewConnectivityJSON);
  console.log($scope.availableclients);
}
  $scope.workflowcnnectivityname = '';
}



$scope.saveMappingArry = [];


//$scope.selectedfield = false;
$scope.savemapping = function(){
 if($scope.availableChannelName.length == 0 || $scope.configdd.length == 0)
 {
alert("Channel Name / Channel Type Select box cannot be empty");
return false;
 }else{
  let channelIdun = 1;
channelIdun = $scope.saveMappingArry.length;
channelIdun ++; 

let getChannelNamevalue = $scope.channelName;
let getChannelTypeValue = $scope.channelValue;

let copyselectedClients = [];
angular.copy($scope.selectedclients, copyselectedClients);

  $scope.saveMappingArry.push({
    "channelName": getChannelNamevalue,
    "channelType": getChannelTypeValue,
    "connectionTypes": copyselectedClients
  });

 
  $timeout( function(){
  $scope.moveAll($scope.selectedclients,$scope.availableclients);
  }, 1000 );


  $scope.channelName = '';
  $scope.channelValue = '';
  
  //$scope.saveMappingArry.push($scope.savemappingobj);
  console.log(angular.toJson($scope.saveMappingArry));

 }

}



    // Create workflow - SAVE
    $scope.submitWorkflowMetaConfigValue = function(){
     $scope.workflowMetadataConfigJSON = {
	"channels": $scope.saveMappingArry,
	"connectivityTypes":$scope.NewConnectivityJSON
}

console.log($scope.NewConnectivityJSON);
console.log (angular.toJson($scope.workflowMetadataConfigJSON));

      $http({
        url: $scope.baseURL + "/createWorkflowMetaDataConfiguration",
        method: 'POST',
        data: angular.toJson($scope.workflowMetadataConfigJSON),
       headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers": "application/json"
        }

     }).then(function(response){
           response="Created a Workflow Meta Data Successfully!";
           $scope.workflowchannelname = '';
$scope.workflowcnnectivityname = '';
$scope.channelName = '';
$scope.saveMappingArry = [];
$scope.workflowMetadataConfigJSON = {};
$scope.NewConnectivityJSON = [];
$scope.channelValue = '';
        $scope.response = response;
        toastr.success($scope.response,'Success Message');
    }).catch(function (data){
      $scope.workflowchannelname = '';
      $scope.workflowcnnectivityname = '';
      $scope.channelName = '';
      $scope.workflowMetadataConfigJSON = {};
      $scope.channelValue = '';
      toastr.error(data.status, 'Error');
           
          //Reset the form
    });

   
  }


  $scope.resetform = function(){
    $scope.workflowchannelname = '';
    $scope.workflowcnnectivityname = '';
    $scope.channelName = '';
    $scope.workflowMetadataConfigJSON = {};
    $scope.channelValue = '';
    $scope.moveAll($scope.selectedclients,$scope.availableclients);
  }


   

/********************Multiselect item *************************************/

$scope.moveItem = function(items, from, to) {

  console.log('Move items: ' + items + ' From: ' + from + ' To: ' + to);
  //Here from is returned as blank and to as undefined

  items.forEach(function(item) {
    var idx = from.indexOf(item);

    if (idx != -1) {
        from.splice(idx, 1);
        to.push(item);      
    }
  });
};
$scope.moveAll = function(from, to) {
  console.log('Move all  From:: '+from+' To:: '+to);
  //Here from is returned as blank and to as undefined
      angular.forEach(from, function(item) {
          to.push(item);
      });
      from.length = 0;
    };                
 
    console.log(JSON.stringify($scope.selectedclients));   
    
    


  // Search & edit module

  var dialogOptions = {
    controller: EditCtrl,
    templateUrl: 'app/workflow-meta-config/searchresultdialog.html'
  };

let getitemforedit = '';
  $scope.searchresult = function(){ 

    $http.get($scope.baseURL+"/workflowMetaDataConfiguration").then(function(response) {
      var searchinputtext = $scope.getinputsearch;
        $scope.itemsgroup = response.data.channels;
        //$scope.items = response.data.channels;
        $scope.items = [];
        for (var i = 0; i<$scope.itemsgroup.length; i++){
          console.log("search input" + angular.toJson($scope.itemsgroup[i].channelName));
            if(searchinputtext == $scope.itemsgroup[i].channelName){
              $scope.items.push({
                'channelId':$scope.itemsgroup[i].channelId,
                'channelName':$scope.itemsgroup[i].channelName,
                'channelType':$scope.itemsgroup[i].channelType,
                'connectionTypes':$scope.itemsgroup[i].connectionTypes
              });
            }
        }
        console.log("JSON STRUCTURE --> " + angular.toJson($scope.items));
      if($scope.items.length > 0 || $scope.items.length == undefined){
          var itemToEdit;
          console.log(angular.toJson($scope.items));
          $dialog.dialog(angular.extend(dialogOptions, {resolve: {item: angular.copy($scope.items)}}))
            .open()
            .then(function() {
              getitemforedit = $rootScope.editctrlvalue;
              $scope.showupdatebtn = true;
              $scope.showsavebtn = false;
              console.log(getitemforedit);
              console.log("getitemforedit" + getitemforedit.channelName);
              $scope.propslitarry = {};
              $scope.channelName = getitemforedit.channelName; 
              $scope.channelValue = getitemforedit.channelType;
              $scope.channelId = getitemforedit.channelId;
              //$scope.availableclients.length = 0;
              console.log("get available client" + $scope.availableclients);
              $scope.input = getitemforedit.connectionTypes;
              let propsplit = getitemforedit.connectionTypes;
                                        $scope.propslitarry = propsplit;
                                        angular.copy($scope.propslitarry,$scope.selectedclients);
                                        $scope.input = $scope.selectedclients;
                                        angular.forEach($scope.selectedclients,function(value){
                                          let getvalueofavailableclients = value.connectionName;
                                          if(getvalueofavailableclients.indexOf($scope.availableclients) == -1){
                                          $scope.availableclients.splice(getvalueofavailableclients, 1);     
                                        }
                                        });

                       /* $scope.updateitems = 
                        {
                          "channels": [
                              {
                                  "channelId": $scope.channelId,
                                  "channelName": $scope.channelName,
                                  "channelType": $scope.channelValue,
                                  "connectionTypes": $scope.input
                              }
                          ]
                      }*/

              console.log("getitemforedit" + $scope.channelName);
             

            console.log("$scope.updateitems --->" + angular.toJson($scope.updateitems));
              
              //Update data
              $scope.updatedata = function(){
               // $scope.copyupdateitems = angular.copy($scope.updateitems);
               $scope.updateitems = 
                {
                  "channels": $scope.saveMappingArry
                }
               /* $scope.updateitems = 
                {
                  "channels": [
                      {
                          "channelId": $scope.channelId,
                          "channelName": $scope.channelName,
                          "channelType": $scope.channelValue,
                          "connectionTypes": $scope.input
                      }
                  ]
              }*/
               // $scope.updateitems = {}; 
              //$scope.updateitems.push($scope.data); 
              console.log("update item second test --> " + angular.toJson($scope.updateitems));
                $http({
                  url: $scope.baseURL + "/createWorkflowMetaDataConfiguration",
                  method: 'POST',
                  data: angular.toJson($scope.copyupdateitems),
                 headers: {
                      "Content-Type": "application/json",
                      "Access-Control-Allow-Origin": "*",
                      "Access-Control-Allow-Headers": "application/json"
                  }
          
               }).then(function(reponse){
                     response="Updated a Workflow Meta Data Successfully!";
                     $scope.resetform();
                     $scope.showupdatebtn = false;
              $scope.showsavebtn = true;
               });
              }  


          });
      }else{
          toastr.error("Please type valid Channel Name");
        
      }

       }) .catch(function (data) {
         console.log(data);
         toastr.error(data);
         resetform();
         });
  


  };
}




  // Search Modal output

  // the dialog is injected in the specified controller
function EditCtrl($scope, item, dialog,$rootScope){
  
    $scope.itemlist = item;
    console.log($scope.itemlist);
    $scope.save = function() {
      dialog.close($scope.edititem);
    };
    
    $scope.close = function(){
      dialog.close(undefined);
    };

    $scope.getdataforedit = function(edititem){
        console.log(edititem);
        $rootScope.editctrlvalue = edititem;
        dialog.close($scope.edititem);
      }
}



})();