(function() {
    'use strict';
  
    angular.module('app')
    .component('uiHeader', {
      controller: HeaderController,
      controllerAs: 'vm',
      templateUrl: 'app/template/zlheader/app.html',
    });
  
    /** @ngInject */
    function HeaderController($scope) {
      const vm = this;
  
      // Scope variables go here:
      // vm.variable = 'value';
  
    }
  
  })();