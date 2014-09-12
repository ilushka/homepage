'use strict';

// background gradient color
var bg_start_rgb =  [0x4c, 0xd1, 0xff]; // 0x4cd1ff
var bg_end_rgb =    [0x00, 0x02, 0x1f]; // 0x00021f

// convert value to hex string
function hexstr(val) {
  var str = Math.round(val).toString(16);
  if (str.length == 1) {
    return '0' + str;
  } else {
    return str;
  }
}

// subtract array a from array b
function sub_arrays(a, b) {
  var result = [];
  for (var ii = 0; ii < a.length; ++ii) {
    result.push(a[ii] - b[ii]);
  }
  return result;
}

// angular

angular.module('myApp', [
  'ui.router'
])

.config(function($stateProvider) {
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
})

.controller('MyAppController', ['$scope', function($scope) {
  var delta_rgb = sub_arrays(bg_end_rgb, bg_start_rgb),
  ratio = new Date().getHours() / 24,
  color = bg_start_rgb.slice(0);
  for (var ii = 0; ii < delta_rgb.length; ++ii) {
    color[ii] = color[ii] + (delta_rgb[ii] * ratio);
  }
  $scope.background_color = '#' + hexstr(color[0]) +
    hexstr(color[1]) + hexstr(color[2]);
}]);
