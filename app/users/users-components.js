(function() {
  'use strict';


  angular.module('app').component('usermanage', {
    controller: usermanagementcontroller,
    //controllerAs: 'vm',
    templateUrl: 'app/users/app.html'
  });

  angular.module('app').config(['$httpProvider', function($httpProvider) {
    $httpProvider.defaults.useXDomain = true;
    delete $httpProvider.defaults.headers.common['X-Requested-With'];
  }]);


  /** @ngInject */
  function usermanagementcontroller($scope,$http,$timeout,toastr,$window,$dialog, $rootScope,) {

    $scope.tab = 1;
    $scope.setTab = function (tabId) {
      $scope.tab = tabId;
    };

    $scope.isSet = function (tabId) {
        return  $scope.tab === tabId;
    };


     // Init
     $scope.init = function () {
      $http.get("/getControllerServiceBaseUrl").then(function (response) {
          $scope.baseURL = response.data;
          console.log($scope.baseURL);
          localStorage.setItem("baseurl", $scope.baseURL);
      }).catch(function (data) {
          console.log(data);
      });
    }

    

    $scope.name = '';
    $scope.username = '';
    $scope.emailid = '';
    $scope.usergroup = '';

    let getusergroupdb = {"groupName":"ESF"}

        /********************* Get User group **********************************/    
        $scope.usergroup = [];
        $scope.usergrouplist = [];
        $scope.callAtTimeout = function () {
          //$scope.usergroup = [];
          //Get workflow metadata config value
          $http.get($scope.baseURL + "/userGroups").then(function (response) {
            console.log(response.data);
              angular.forEach(response.data, function (value) {
                  $scope.usergroup.push(value.groupName);
                  $scope.usergrouplist.push(value);
              });
          }).catch(function (data) {
              console.log(data);
          });
      }

      $timeout(function () { $scope.callAtTimeout(); }, 1000);






    // Create User
    $scope.submituserlist = function () {
        let getuser = $scope.name;
        let getusername = $scope.username;
        let getemailid = $scope.emailid;
        let getusergroup = $scope.usergroupname;
        let getgroupid;
        for(var i=0;i<$scope.usergrouplist.length;i++){
            if(getusergroup == $scope.usergrouplist[i].groupName){
                getgroupid = $scope.usergrouplist[i].grpId;
            }
        }

        console.log(getgroupid);

        let Userlistdb = {
        "name":getuser,
        "userName":getusername,
        "emailAddress":getemailid,
        "groups":[
            {
                "grpId":getgroupid
            }
        ]
    }

    console.log(angular.toJson(Userlistdb));

        $http({
            url: $scope.baseURL + "/addUser",
            method: 'POST',
            data: angular.toJson(Userlistdb),
            headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "application/json"
            }
        }).then(function (response) {
            response = "Created User Successfully!";
            toastr.success(response, 'Success Message');
            //$scope.resetform();
            $window.location.reload();
        }).catch(function (data) {
            $scope.resetform();
            toastr.error(data.status, 'Error');
            //console.log("Error Save: "+data.status);
        });
    }   
    
    

    $scope.resetform = function(){
        $scope.name = null;
    $scope.username = null;
    $scope.emailid = null;
    $scope.usergroupname = null;
    }



$scope.addusergroup = function(){
    let getusegroup = $scope.addusergroupname;
  

    console.log(getusegroup);

    let addnewusergroupdb ={"groupName":getusegroup}

console.log(angular.toJson(addnewusergroupdb));

    $http({
        url: $scope.baseURL + "/userGroups",
        method: 'POST',
        data: angular.toJson(addnewusergroupdb),
        headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers": "application/json"
        }
    }).then(function (response) {
        response = "Created New Usergroup Successfully!";
        toastr.success(response, 'Success Message');
       // $window.location.reload();
    }).catch(function (data) {
        toastr.error(data.status, 'Error');
        //console.log("Error Save: "+data.status);
    });
}



 // Search & edit module 
 var dialogOptions = {
    controller: EditCtrl,
    templateUrl: 'app/users/searchresultdialog.html'
};

let getitemforedit = '';
$scope.searchresult = function () {
    $http.get($scope.baseURL + "/usersByGroup?groupName=" + $scope.getinputsearch).then(function (response) {
        $scope.items = response.data;
        console.log("Search Result" + response.data);
        if ($scope.items.length > 0) {
            var itemToEdit;
            console.log(angular.toJson($scope.items));
            $dialog.dialog(angular.extend(dialogOptions, { resolve: { item: angular.copy($scope.items) } }))
                .open()
                .then(function () {
                    $scope.getinputsearch = "";
                })
            }
        }).catch(function (data) {
            console.log(data);
            data = "No users in the Group"
            toastr.error(data);
        });
    }


/****************************************User Search result ***************************************/
 // Search & edit module 
 var dialogOptions = {
    controller: UpdateCtrl,
    templateUrl: 'app/users/searchresultuser.html'
};

$scope.usersearchresult = function () {
    $http.get($scope.baseURL + "/searchUser?userid=" + $scope.getinputsearch).then(function (response) {
        $scope.useritems = response.data;
        console.log("Search Result" + response.data);
        if ($scope.useritems.length > 0) {
            var itemToEdit;
            console.log(angular.toJson($scope.useritems));
            $dialog.dialog(angular.extend(dialogOptions, { resolve: { item: angular.copy($scope.useritems) } }))
                .open()
                .then(function () {
                    $scope.getinputsearch = "";
                })
            }
        }).catch(function (data) {
            console.log(data);
            data = "Enter valid username"
            toastr.error(data);
        });
    }

} // Controller ends



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
           // $window.location.reload();
            dialog.close(true);
        };

        $scope.getdataforedit = function (edititem) {
            console.log(edititem);
            $rootScope.editctrlvalue = edititem;
            dialog.close($scope.edititem);
        }
    }


    function UpdateCtrl($scope, item, dialog, $rootScope,$window) {
        $scope.itemlist = item;
        let getitemgroup;
        
        console.log($scope.itemlist);
        for (var l=0;l<$scope.itemlist.length;l++){
            getitemgroup = $scope.itemlist[l].groups;
            $scope.getitemlistgroup =  getitemgroup;
            console.log($scope.getitemlistgroup);
        }
        //$scope.getitemlistgroup =  getitemgroup;
       
        $scope.save = function () {
            dialog.close($scope.edititem);
        };

        $scope.close = function () {
           // $window.location.reload();
            dialog.close(true);
        };

        $scope.getdataforedit = function (edititem) {
            console.log(edititem);
            $rootScope.updatectrlvalue = edititem;
            dialog.close($scope.edititem);
        }
    }



})();