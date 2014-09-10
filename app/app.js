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
        'test-tile-1-1': {
          templateUrl: 'test-tile-1-1.html'
        },
        'viewB': {
          template: 'viewB'
        }
      }
    });
});
