(function() {
  'use strict';


  angular.module('app').component('login', {
    controller: logincontroller,
    //controllerAs: 'vm',
    templateUrl: 'app/login/login.html'
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
  function logincontroller($scope,$http) {

   

  }

})();