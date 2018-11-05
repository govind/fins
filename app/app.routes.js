(function() {
  'use strict';

  angular.module('app').config(routerConfig);

  /** @ngInject */
  function routerConfig($stateProvider, $urlRouterProvider) {

    $stateProvider
    .state('login', {
      url: '/login',
      component: 'login',
    })
    .state('home', {
      url: '/home',
      component: 'home',
    })
    .state('workflowmetaconfig', {
      url: '/workflow-meta-config',
      component: 'workflowmetaconfig',
    })    
    .state('workflowconfig', {
      url: '/',
      component: 'workflowconfig',
    })
    .state('usermanage', {
      url: '/users',
      component: 'usermanage',
    });

    $urlRouterProvider.otherwise('/');
  }

})();
