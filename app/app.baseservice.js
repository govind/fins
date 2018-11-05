angular.module('app').config(serviceconfig);

  /** @ngInject */
  function serviceconfig($scope,$http,$window,$rootScope) {
    $http.get("/getControllerServiceBaseUrl").then(function(response) {
        $scope.baseURL = response.data;
        $rootScope.base_URL =  $scope.baseURL;
          }) .catch(function (data) {
            console.log(data);
            });
            
            $window.localStorage.setItem($scope.baseURL);
  
}