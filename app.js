angular.module('app',['textEditor','ngSanitize']);

angular.module('app')
.controller('appCtrl', ['$scope', function($scope) {
  $scope.editorValue = "please type :) or <3 in editor to see smileys";
  $scope.msgList = [];

  $scope.clear = function() {
    $scope.editorValue = "";
  }

  $scope.onEnter = function() {
    var message = {text: $scope.editorValue};
    $scope.msgList.push(message);
    $scope.editorValue = "";
  }
}]);
