(function () {
    'use strict';

// Add module to component
    angular.module('app').component('workflowconfig', {
        controller: WorkflowConfigController,
        templateUrl: 'app/workflow-config/app.html'
    });


    // Cross domain origin
    angular.module('app').config(['$httpProvider', function ($httpProvider) {
        $httpProvider.defaults.useXDomain = true;
        delete $httpProvider.defaults.headers.common['X-Requested-With'];
    }]);


    angular.module('app').directive('myOnKeyDownCall', function () {
        return function (scope, element, attrs) {
            element.bind("keydown keypress", function (event) {
                scope.$apply(function () {
                    scope.$eval(attrs.ngEnter);
                });
                event.preventDefault();
            });
        };
    });



    angular.module('app').directive("taskListDirective", function () {
		return {
            restrict: 'E',
            templateUrl: "app/workflow-config/task-directive.html",
            scope: {
                action: "=",
                selectedclients: "=",
                getselectedinput: "&",
                availableclients: "="
            },
            link: function(scope, elem, attrs) {
                console.log(elem[0].id);
                console.log(attrs.id)
    
            },
			controller: function ($scope,$http) {
                //public Scope

               /********************** get propertie and split common function *******************************/    
        // // Get property files
        var properties;
        $scope.cType = {};  // Connectivity type Invoking the item from propertie files
        $scope.dataType = {}; // Data type Invoking the item from propertie files
        $scope.selectedclients = [];
        $scope.available = [];
        $scope.input = {};
        function extractProperties(data) {
            var keyValuePairs = data.split("\n");
            properties = [];
            for (var i = 0; i < keyValuePairs.length; i++) {
                var keyValueArr = keyValuePairs[i].trim().split("=");
                var key = keyValueArr[0];
                var value = keyValueArr[1];
                properties[key] = value;
            }
            return properties;
        }


    /********************* Connectivity type checkbox call ****************************/  

            $http.get('workflowConfigMeta.properties').then(function (response) {
                properties = extractProperties(response.data);
                angular.forEach(properties.StakeholdersOrConnectivityTypes, function () {
                    let stringassplit = properties.StakeholdersOrConnectivityTypes.split(",");
                    $scope.cType = stringassplit;
                });
                angular.forEach(properties.TaskType, function () {
                    let stringassplit = properties.TaskType.split(",");
                    $scope.dataType = stringassplit;
                });


                $scope.getactionType = [];
                $scope.getinputType = {};
                $scope.loopingvaltype = [];
                var userInfo = properties.ActionInputs;
                var ValuePairs = userInfo.split(",");
                for (var i = 0; i < ValuePairs.length; i++) {
                    var ValueArr = ValuePairs[i].trim().split(",");
                    var actionproperties = ValueArr[0].split("-", 1).join(':');
                    var inputnproperties = ValueArr[0].split(';').join(',');
                    inputnproperties = inputnproperties.trim().split('-').slice(1);
                    $scope.loopingvaltype.push({ action: actionproperties, input: inputnproperties });
                }

                for (var i = 0; i < $scope.loopingvaltype.length; i++) {
                    $scope.getactionType.push($scope.loopingvaltype[i].action);
                    //console.log("Actionnnnnnn -" + $scope.getactionType)
                }

/****************************** On Task Action select get the value in to Input Available ****************************/                
                $scope.getselectedinput = function (index) {
                    $scope.propslitarry = {};
                    $scope.availableclients = [];
                    $scope.availableclientstest = [];
                        var getcolumnaction = $scope.action;
                        //console.log("getcolumnaction ---**&&" + getcolumnaction);
                        for (var i = 0; i < $scope.loopingvaltype.length; i++) {
                            if (getcolumnaction == $scope.loopingvaltype[i].action) {
                                let propsplit = $scope.loopingvaltype[i].input[0].split(",");
                                $scope.propslitarry = propsplit;
                                $scope.availableclients.length = 0;
                                console.log($scope.propslitarry);
                            
                                $scope.availableclientstest.push([{id:index,value:$scope.propslitarry}]);
                                console.log(angular.toJson($scope.availableclientstest));
                              for(var l=0;l<$scope.availableclientstest.length;l++){
                                 angular.forEach($scope.availableclientstest[l],function(key,value){
                                    let gwtavailableclientid = key.id;
                                    let gwtavailableclientvalue = key.value;
                                    console.log(gwtavailableclientid + "" + gwtavailableclientvalue);
                                    if(index == gwtavailableclientid){
                                        /*  $('#available_'+index).empty();
                                           angular.forEach($scope.availableclients[l],function(value){
                                               $('#available_'+index).append($("<option></option>").text(value).val(value));
                                           });
                                           */
                                           angular.forEach(gwtavailableclientvalue,function(value){
                                                   $scope.availableclients.push(value);
                                           });
                                   }else{
                                    $scope.availableclients.length = 0;
                                   }  
                                 });
                            } 

                                //angular.copy($scope.propslitarry, $scope.availableclients);
                               // $scope.selectedclients.length = 0;
                                //console.log('..............' +  angular.toJson($scope.propslitarry));    
                            }
                        }
                }
            });

            $scope.additem = function (items) {
                items.forEach(function (item) {

                    var idx = $scope.availableclients.indexOf(item);
                    if (idx != -1) {
                        $scope.availableclients.splice(idx, 1);
                        $scope.selectedclients.push(item);
                    }  
                    //$scope.column.input = $scope.selectedclients;
                });
            }
    
    
            $scope.removeitem = function (items) {
                items.forEach(function (item) {
                    var idx = $scope.selectedclients.indexOf(item);
                    if (idx != -1) {
                        $scope.selectedclients.splice(idx, 1);
                        $scope.availableclients.push(item);
                    } 
                });
            }

			} // Controller ends here
		};
	})



    /** @ngInject */
    function WorkflowConfigController($scope, $http, toastr, $templateCache, $dialog, $rootScope, $timeout) {

        $scope.showsavebtn = true;

        // Init
        $scope.init = function () {
            $http.get("/getControllerServiceBaseUrl").then(function (response) {
                $scope.baseURL = response.data;
                console.log($scope.baseURL);

                localStorage.setItem("baseurl", $scope.baseURL);
            }).catch(function (data) {
                console.log(data);
            });


            //get Properties file
            $scope.inputclient = {};
            $http.get('workflowConfigMeta.properties').then(function (response) {
                properties = extractProperties(response.data);
                angular.forEach(properties.StakeholdersOrConnectivityTypes, function () {
                    let stringassplit = properties.StakeholdersOrConnectivityTypes.split(",");
                    $scope.cType = stringassplit;
                });
                angular.forEach(properties.TaskType, function () {
                    let stringassplit = properties.TaskType.split(",");
                    $scope.dataType = stringassplit;
                });


                $scope.getactionType = [];
                $scope.getinputType = {};
                $scope.loopingvaltype = [];
                var userInfo = properties.ActionInputs;
                var ValuePairs = userInfo.split(",");
                for (var i = 0; i < ValuePairs.length; i++) {
                    var ValueArr = ValuePairs[i].trim().split(",");
                    var actionproperties = ValueArr[0].split("-", 1).join(':');
                    var inputnproperties = ValueArr[0].split(';').join(',');
                    inputnproperties = inputnproperties.trim().split('-').slice(1);
                    $scope.loopingvaltype.push({ action: actionproperties, input: inputnproperties });
                }

                for (var i = 0; i < $scope.loopingvaltype.length; i++) {
                    $scope.getactionType.push($scope.loopingvaltype[i].action);
                    //console.log("Actionnnnnnn -" + $scope.getactionType)
                }

/****************************** On Task Action select get the value in to Input Available ****************************/                

            });
        } // Init Ends


    /********************* Get Channel Name **********************************/    
        $scope.callAtTimeout = function () {
            $scope.getmetadata = [];
            //Get workflow metadata config value
            $http.get("http://localhost/project-file/json/workflowMetaDataConfiguration.json").then(function (response) {
                angular.forEach(response.data.channels, function (value) {
                    var metachannelname = value.channelName;
                    $scope.configdd.push(metachannelname);
                });
                $scope.getmetadata = response.data;
            }).catch(function (data) {
                console.log(data);
            });
        }

        $timeout(function () { $scope.callAtTimeout(); }, 2000);


// Globally used
        $scope.configdd = [];
        $scope.configconnectivityName = [];
        let channelTypeNew = '';
        let connectionTypeNew = '';
        $scope.ActualJSON = {};
        $scope.columns = [];


 /*********************** Create Workflow ******************************/

        // Create workflow - SAVE
        $scope.submitWorkflowConfigValue = function () {
            let workflowName = $scope.workflowname;
            channelTypeNew = $scope.channelValue;
            connectionTypeNew = $scope.connectionValue;
            $scope.ActualJSON =
                {
                    "workflowName": workflowName,
                    "channelType": channelTypeNew,
                    "connectionType": connectionTypeNew,
                    "connectivityTypes": $scope.selection,
                    "taskList": $scope.columns
                };

            console.log(angular.toJson($scope.ActualJSON));
            $http({
                url: $scope.baseURL + "/createWorkflowConfiguration",
                method: 'POST',
                data: angular.toJson($scope.ActualJSON),
                headers: {
                    "Content-Type": "application/json",
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Headers": "application/json"
                }
            }).then(function (response) {
                response = "Created Workflow Configuration Successfully!";

                $scope.response = response;
                toastr.success($scope.response, 'Success Message');

                //Success clear form field
                $scope.resetform();


            }).catch(function (data) {
                $scope.resetform();
                toastr.error(data.status, 'Error');
                //console.log("Error Save: "+data.status);
            });
        }



    /**************************** Reset Function *******************************/    
        $scope.resetform = function(){
            $scope.workflowname = "";
            $scope.channelValue = "";
            $scope.connectionValue = "";
            $scope.columns.length = 1;
            $scope.selectedclients.length = 0;
            $scope.availableclients.length = 0;
            $scope.selection.length = 0;
            $scope.showupdatebtn = false;
            $scope.showsavebtn = true;
            $scope.workflowConfigInput.$setPristine();
            $scope.workflowConfigInput.$setUntouched();

            if ($scope.columns.length == 1) {
               $scope.columns = [
                {
                    id: 0,
                    name: '',
                    input: $scope.selectedclients,
                    type: '',
                    action: '',
                    deadlineForTaskCompletionInHrs: '',
                    output: null
                }
            ];
        }else {
            $scope.columns.splice($scope.columns.indexOf($scope.column), 1);
        }
        }

        //Search module


        $scope.callRestService = function () {
            $http.get("http://localhost/project-file/json/workflowMetaDataConfiguration.json").then(function (response) {
                console.log(response.data);
				console.log(response);
                getMetaDataChannels = response.data.channels;
                $scope.results.push(getMetaDataChannels);
            }).catch(function (data) {
                //console.log(data);
            });
        }


   /********************** Selected channel name based Channel type dropdown *********************/     
        //Select connectivity type based on connection type
        $scope.selectconnectivitytype = function () {
            $scope.configconnectivityName = [];
            $scope.coretypeName = []
            let convertgetmetadata = $scope.getmetadata.channels;
            let getconnectiontype,
                getconectionnamemeta;
            for (var i = 0; i < convertgetmetadata.length; i++) {
                //console.log("if condition" + convertgetmetadata[i].channelName);
                if ($scope.channelValue == convertgetmetadata[i].channelName) {
                    //console.log(convertgetmetadata.connectionTypes);
                    getconnectiontype = convertgetmetadata[i].connectionTypes;
                    for (var j = 0; j < getconnectiontype.length; j++) {
                        //console.log("connection type loop - " + getconnectiontype[j].connectionName);
                        getconectionnamemeta = getconnectiontype[j].connectionName;
                        $scope.configconnectivityName.push(getconectionnamemeta);
                    }
                }
            }

            for (var i = 0; i < convertgetmetadata.length; i++) {
                console.log("if condition" + convertgetmetadata[i].channelName);
                if ($scope.channelValue == convertgetmetadata[i].channelName) {
                    $scope.coretypeName.push(convertgetmetadata[i].channelType);
                }
            }
        }


    /******************************* Update record *****************************/
    $scope.getselectedinput = function (index) {
        $scope.propslitarry = {};
        $scope.availableclients = [];
        $scope.availableclientstest = [];
            var getcolumnaction = index;
            for (var i = 0; i < $scope.loopingvaltype.length; i++) {
                if (getcolumnaction == $scope.loopingvaltype[i].action) {
                    if($scope.loopingvaltype[i].input[0] != "" || $scope.loopingvaltype[i].input[0] != undefined || $scope.loopingvaltype[i].input[0] != null || $scope.loopingvaltype[i].input[0].length == 0){
                    let propsplit = $scope.loopingvaltype[i].input[0].split(",");
                    $scope.propslitarry = propsplit;
                    $scope.availableclients.length = 0;
                    $scope.availableclientstest.push([{id:index,value:$scope.propslitarry}]);
                    console.log(angular.toJson($scope.availableclientstest));
                  for(var l=0;l<$scope.availableclientstest.length;l++){
                     angular.forEach($scope.availableclientstest[l],function(key,value){
                        let gwtavailableclientid = key.id;
                        let gwtavailableclientvalue = key.value;
                        console.log(gwtavailableclientid + "" + gwtavailableclientvalue);
                        if(index == gwtavailableclientid){
                               angular.forEach(gwtavailableclientvalue,function(value){
                                       $scope.availableclients.push(value);
                               });
                       }else{
                        $scope.availableclients.length = 0;
                       }  
                     });
                } 
                   // $scope.selectedclients.length = 0;
            }else{
                return false;
            }
                }
            }
    }
    /***************************************************************************/
    /********************** get propertie and split common function *******************************/    
        // // Get property files
        var properties;
        $scope.cType = {};  // Connectivity type Invoking the item from propertie files
        $scope.dataType = {}; // Data type Invoking the item from propertie files

        function extractProperties(data) {
            var keyValuePairs = data.split("\n");
            properties = [];
            for (var i = 0; i < keyValuePairs.length; i++) {
                var keyValueArr = keyValuePairs[i].trim().split("=");
                var key = keyValueArr[0];
                var value = keyValueArr[1];
                properties[key] = value;
            }
            return properties;
        }


    /********************* Connectivity type checkbox call ****************************/    
        // Selected Connectivity Type
        $scope.selection = [];

        // Toggle selection for a given connectivity by name
        $scope.toggleSelection = function toggleSelection(cTypeName) {
            var idx = $scope.selection.indexOf(cTypeName);
            if (idx > -1) {
                $scope.selection.splice(idx, 1);
            }

            // Is newly selected
            else {
                $scope.selection.push(cTypeName);
            }
        };


        /********************Multiselect Listbox common function *************************************/

        $scope.moveItem = function (items, from, to) {

            //console.log('Move items: ' + items + ' From: ' + from + ' To: ' + to);
            //Here from is returned as blank and to as undefined

        };
        $scope.moveAll = function (from, to) {
            //console.log('Move all  From:: '+from+' To:: '+to);
            angular.forEach(from, function (item) {
                to.push(item);
            });
            from.length = 0;
        };



/*********************** Add task and update record on typing ***************/

        $scope.selectedtest = [];

        // Add task functionality
        var selectedclientvalue;
        let getcolumnsjs = [];

        
   /*     $scope.selectedclients = [];
        let getselectval = '';
        $scope.$watch('getselectval', function() {
            alert('hey, myVar has changed!');
            getselectavailable();
        });


getselectval = this.val();
console.log("getselectval" + getselectval);
}

*/

console.log("$scope.action --> " + $scope.action);
$scope.input = [];

        $scope.columns = [{
            id: 0,
            name: '',
            input: $scope.input,
            type: '',
            action: $scope.action,
            deadlineForTaskCompletionInHrs: '',
            output: null
        }];


        $scope.addNewColumn = function (index) {
            var newItemNo = $scope.columns.length;
            $scope.getidcount = $scope.columns.length + 1;
           // let copyinutitem;
            //angular.forEach($scope.columns.length,function(key){
            //angular.copy($scope.columns.input[key],copyinutitem);
            //});


            console.log("$scope.action --> " + $scope.input);
            $scope.columns.push(
                {
                    id: newItemNo,
                    name: '',
                    input: $scope.input,
                    type: '',
                    action: $scope.action,
                    deadlineForTaskCompletionInHrs: '',
                    output: null
                }
            );

        };



    /*********************** Remove task function *****************************/    
        $scope.removeColumn = function (index) {
            console.log("index--> " + index);
            var newItemNo = $scope.columns.length - 1;
            index = index;
            console.log("index" + index + newItemNo);

            for(var i=0;i<$scope.columns.length;i++){
                let getcolumnslength = $scope.columns[i].id;
                if (getcolumnslength == index) {
                    $scope.columns.splice(getcolumnslength, 1);
                    //$scope.columns.splice($scope.columns[i].length,1);
                }
            }
            
            
           

        };

    /**************** Dialog external ctrl link **********************/    

    // Search & edit module 
        var dialogOptions = {
            controller: EditCtrl,
            templateUrl: 'app/workflow-config/searchresultdialog.html'
        };


    /**************** Search and display the record in dialog ************************/    
        // Search box function 
        let getitemforedit = '';
        let getworkflowID;
        $scope.searchresult = function () {
            $http.get("http://localhost/project-file/json/searchconfig.json").then(function (response) {
                $scope.items = response.data;
                console.log("Search Result" + response.data);
                if ($scope.items.length > 0) {
                    var itemToEdit;
                    console.log(angular.toJson($scope.items));
                    $dialog.dialog(angular.extend(dialogOptions, { resolve: { item: angular.copy($scope.items) } }))
                        .open()
                        .then(function () {
                            // edited Search record to respective fields
                            getitemforedit = $rootScope.editctrlvalue;
                            $scope.showupdatebtn = true;
                            $scope.showsavebtn = false;
                            $scope.columns = [
                                {
                                    id: 0,
                                    name: '',
                                    input: $scope.input,
                                    type: '',
                                    action: '',
                                    deadlineForTaskCompletionInHrs: '',
                                    output: null
                                }
                            ];
                            $scope.propslitarry = {};
                            $scope.workflowname = getitemforedit.workflowName;
                            $scope.channelValue = getitemforedit.channelType;
                            $scope.connectionValue = getitemforedit.connectionType;
                            getworkflowID = getitemforedit.workflowId;
                            $scope.configconnectivityName.push(getitemforedit.connectionType);
                            $scope.selectconnectivitytype();
                            var getupdateID;
                            $scope.updatepropslitarry = {};
                            $scope.selectedclients = [];
                            $scope.availableclients = [];
                            $scope.availableclientstest = [];
                            $scope.selection = getitemforedit.connectivityTypes;
                            for (var i=0;i<$scope.columns.length;i++){
                                for (var j = 0; j < getitemforedit.taskList.length; j++) {
                                    if(i == j){
                                        getupdateID = $scope.columns.length;
                                    $scope.columns[j].id = getitemforedit.taskList[j].id;
                                    $scope.columns[j].name = getitemforedit.taskList[j].name;
                                    $scope.columns[j].type = getitemforedit.taskList[j].type;
                                    $scope.columns[j].action = getitemforedit.taskList[j].action;
                                    $scope.columns[j].input = getitemforedit.taskList[j].input;
                                    //$scope.updatepropslitarry = $scope.columns[j].input;
                                   // console.log("Propsplit connection --> " + getitemforedit.taskList[j].input);
                                   console.log("//$scope.loopingvaltype" + angular.toJson($scope.loopingvaltype));
                                   angular.forEach($scope.loopingvaltype, function (key, value) {
                                       let getloopingvaltypearry = key.action;
                                        console.log("getloopingvaltypearry" + getloopingvaltypearry);
                                        if (getitemforedit.taskList[j].action == getloopingvaltypearry) {
                                                let propsplit = $scope.loopingvaltype[j].input[0].split(",");
                                                $scope.propslitarry = propsplit;
                                                $scope.availableclients.length = 0;
                                                             angular.forEach($scope.propslitarry,function(value){
                                                                   $scope.availableclients.push(value);
                                                           });
                                              $scope.availableclients = $scope.availableclients.filter(val => !$scope.columns[j].input.includes(val));
                                            console.log("$scope.availableclients---> " + $scope.availableclients);
                                        }
                                   })
                                   console.log("$scope.columns[j].input ==>" + $scope.columns[j].input);
                                    $scope.columns[j].deadlineForTaskCompletionInHrs = getitemforedit.taskList[j].deadlineForTaskCompletionInHrs;
                                    }
                                    $scope.columns.push({
                                        id: $scope.columns[j].id,
                                        name: $scope.columns[j].name,
                                        input:$scope.columns[j].input,
                                        type: $scope.columns[j].type,
                                        action: $scope.columns[j].action,
                                        deadlineForTaskCompletionInHrs: $scope.columns[j].deadlineForTaskCompletionInHrs,
                                        output: null
                                    });
                                }
                                $scope.columns.length = getitemforedit.taskList.length;
                            }
                        });
                } else {
                    toastr.error("Please type valid Name");
                }

            }).catch(function (data) {
                console.log(data);
            });
            
            $scope.getinputsearch = ''; //empty Search box only Go btn clicked

        }; //Search ends




/******************************* Update the record **************************************/
        $scope.updatedata = function () {
            $scope.showupdatebtn = false;
            $scope.showsavebtn = true;
            let updateworkflowname = $scope.workflowname;
            console.log("updateworkflowname ==> " + updateworkflowname);
            let updateChanneltype = $scope.channelValue;
            let updateconnectivitytype = $scope.selection;
            let updateconnectiontype = $scope.connectionValue;
            var udateJSON = {
                "workflowId": getworkflowID,
                "workflowName": updateworkflowname,
                "channelType": updateChanneltype,
                "connectivityTypes": updateconnectivitytype,
                "connectionType": updateconnectiontype,
                "taskList": $scope.columns
            }
            console.log("updated JSON to DB" + angular.toJson(udateJSON));


            // update service call

            $http({
                url: $scope.baseURL + "/updateWorkflowConfiguration",
                method: 'POST',
                data: angular.toJson(udateJSON),
                headers: {
                    "Content-Type": "application/json",
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Headers": "application/json"
                }
            }).then(function (response) {
                response = "Updated Workflow Configuration Successfully!";
                $scope.response = response;
                toastr.success($scope.response, 'Success Message');
                console.log(angular.toJson(udateJSON));
                //Success clear form field
                $scope.resetform();

            }).catch(function (data) {
                $scope.resetform();
                toastr.error(data.status, 'Error');
                console.log("Error Save: " + data.status);
            });
        }//updatedata ends
        /**************End Update ***************/
    }



/************************** Edit controller invoke the dialog ***************************/    
    // Search Modal output
    // the dialog is injected in the specified controller
    function EditCtrl($scope, item, dialog, $rootScope,$window) {
        $scope.itemlist = item;
        console.log($scope.itemlist);
        $scope.save = function () {
            dialog.close($scope.edititem);
        };

        $scope.close = function () {
            $window.location.reload();
            dialog.close(true);
        };

        $scope.getdataforedit = function (edititem) {
            console.log(edititem);
            $rootScope.editctrlvalue = edititem;
            dialog.close($scope.edititem);
        }
    }

})();