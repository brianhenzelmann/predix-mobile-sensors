angular.module('starter.controllers', [])

.controller('AppCtrl', function($scope, $ionicModal, $timeout) {

  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //$scope.$on('$ionicView.enter', function(e) {
  //});
})

.controller('SensorsCtrl', function($scope) {
  console.log('SensorsCtrl called');
  $scope.watching = false;
  $scope.logs = [];
  $scope.interval = 300;

  $scope.onSuccessAcceleration = function(acceleration) {
    $scope.acceleration = acceleration;
    $scope.$apply();
  };

  $scope.onErrorAcceleration = function() {
    $scope.logs.push({date:(new Date()).toLocaleString(), message: 'Error loading acceleration data.'});
  };

  $scope.onSuccessCompass = function(heading) {
    $scope.heading = heading;
    $scope.$apply();
  };

  $scope.onErrorCompass = function(error) {
    $scope.logs.push({date:(new Date()).toLocaleString(), message: 'Error loading compass data.'});
  };

  $scope.onSuccessPosition = function(position) {
    $scope.position = position;
    $scope.$apply();
  };

  $scope.onErrorPosition = function(error) {
    $scope.logs.push({date:(new Date()).toLocaleString(), message: 'Error loading compass data.'});
  };

  $scope.watch = function(){
    if($scope.watching === true){
      console.log('============== Enabling sensors ================');
      $scope.accelerationWatchId = navigator.accelerometer.watchAcceleration($scope.onSuccessAcceleration, $scope.onErrorAcceleration, {
        frequency: $scope.interval
      });

      $scope.compassWatchId = navigator.compass.watchHeading($scope.onSuccessCompass, $scope.onErrorCompass, {
        frequency: $scope.interval
      });

      $scope.geoWatchID = navigator.geolocation.watchPosition($scope.onSuccessPosition, $scope.onErrorPosition, {
        maximumAge: $scope.interval, 
        timeout: $scope.interval, 
        enableHighAccuracy: true 
      });
    } else{
      console.log('============== Disabling sensors ================');
      if($scope.accelerationWatchId){
        navigator.accelerometer.clearWatch($scope.accelerationWatchId);
        delete $scope.accelerationWatchId;
      }
      if($scope.compassWatchId){
        navigator.compass.clearWatch($scope.compassWatchId);
        delete $scope.compassWatchId;
      }
      if($scope.geoWatchID){
        navigator.geolocation.clearWatch($scope.geoWatchID);
        delete $scope.geoWatchID;
      }
    }
    $scope.watching = !$scope.watching;
  };

  window.addEventListener("batterystatus", onBatteryStatus, false);

  function onBatteryStatus(status) {
    $scope.status = status;
  }

  $scope.watch();
})

.controller('SettingsCtrl', function($scope, $stateParams) {
});
