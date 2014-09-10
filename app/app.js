'use strict';

// Declare app level module which depends on views, and components
angular.module('myApp', [
  'ui.router'
])
.config(function ($stateProvider) {
  $stateProvider
    .state('index', {
      url: '',
      views: {
        'viewA': {
          template: 'viewA'
        },
        'viewB': {
          template: 'viewB'
        }
      }
    });
});
