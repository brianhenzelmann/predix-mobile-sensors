angular.module('starter.controllers', [])

.controller('AppCtrl', function($scope, $ionicModal, $timeout) {

  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //$scope.$on('$ionicView.enter', function(e) {
  //});
})

.controller('SensorsCtrl', function($scope, $rootScope) {
  console.log('SensorsCtrl called');
  $scope.watching = false;
  $scope.logs = [];
  $scope.interval = 300;

  // Settings
  console.log('=========== Loading localStorage =============');
  $scope.timeseriesUrl = localStorage.timeseriesUrl ? localStorage.timeseriesUrl:'';
  $scope.predixZoneId = localStorage.predixZoneId ? localStorage.predixZoneId:'';
  $scope.trustedIssuerId = localStorage.trustedIssuerId ? localStorage.trustedIssuerId:'';
  $scope.clientId = localStorage.clientId ? localStorage.clientId:'';
  $scope.clientSecret = localStorage.clientSecret?localStorage.clientSecret:'';

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

  $scope.socket = io("wss://gateway-predix-data-services.run.aws-usw02-pr.ice.predix.io/v1/stream/messages", {
    extraHeaders: {
      'Predix-Zone-Id': '72963a4d-b5bc-4cf1-b7bd-ef9f363ecb5b',
      'Authorization': 'Bearer eyJhbGciOiJSUzI1NiIsImtpZCI6ImxlZ2FjeS10b2tlbi1rZXkiLCJ0eXAiOiJKV1QifQ.eyJqdGkiOiIzOTMxYWRhOWI0ZWY0MDQwYWM2NzIyNWYyZTczMGM3NiIsInN1YiI6InByZWRpeC1zZWVkIiwic2NvcGUiOlsidWFhLnJlc291cmNlIiwic2NpbS5tZSIsImFzc2V0LnpvbmVzLmU2NGQ0MDY2LTY5M2MtNGViYS05MzcxLTAwN2VhZTZmMDUzZC51c2VyIiwib3BlbmlkIiwidmlld3MucG93ZXIudXNlciIsInByZWRpeC1hc3NldC56b25lcy5lNjRkNDA2Ni02OTNjLTRlYmEtOTM3MS0wMDdlYWU2ZjA1M2QudXNlciIsInByZWRpeC1hc3NldC56b25lcy5kNTAzZWZmNi02YjM1LTRiZjItOTUwMi1kOTE5OGNiNzczZWIudXNlciIsInZpZXdzLmFkbWluLnVzZXIiLCJ2aWV3cy56b25lcy5jYzVjODRlMy0zZTUzLTQzZTYtODA2Mi0xMjA3MWE4OWQwMzIudXNlciIsInVhYS5ub25lIiwidGltZXNlcmllcy56b25lcy43Mjk2M2E0ZC1iNWJjLTRjZjEtYjdiZC1lZjlmMzYzZWNiNWIucXVlcnkiLCJ0aW1lc2VyaWVzLnpvbmVzLjcyOTYzYTRkLWI1YmMtNGNmMS1iN2JkLWVmOWYzNjNlY2I1Yi5pbmdlc3QiLCJ0aW1lc2VyaWVzLnpvbmVzLjcyOTYzYTRkLWI1YmMtNGNmMS1iN2JkLWVmOWYzNjNlY2I1Yi51c2VyIiwicHJlZGl4LWFzc2V0LnpvbmVzLmNlY2IwMzNiLTQ0NTItNDE3OC1hNjc5LTVmNTlhNDMxYjRmNS51c2VyIl0sImNsaWVudF9pZCI6InByZWRpeC1zZWVkIiwiY2lkIjoicHJlZGl4LXNlZWQiLCJhenAiOiJwcmVkaXgtc2VlZCIsImdyYW50X3R5cGUiOiJjbGllbnRfY3JlZGVudGlhbHMiLCJyZXZfc2lnIjoiZDAwNTg4ODciLCJpYXQiOjE0NzcxNTg0ODEsImV4cCI6MTQ3NzIwMTY4MSwiaXNzIjoiaHR0cHM6Ly83YTQ0ODVlNy05N2FhLTQ5ZTktOTYxMC0zOTU2OGJhNzdlNDIucHJlZGl4LXVhYS5ydW4uYXdzLXVzdzAyLXByLmljZS5wcmVkaXguaW8vb2F1dGgvdG9rZW4iLCJ6aWQiOiI3YTQ0ODVlNy05N2FhLTQ5ZTktOTYxMC0zOTU2OGJhNzdlNDIiLCJhdWQiOlsic2NpbSIsInZpZXdzLnpvbmVzLmNjNWM4NGUzLTNlNTMtNDNlNi04MDYyLTEyMDcxYTg5ZDAzMiIsIm9wZW5pZCIsInRpbWVzZXJpZXMuem9uZXMuNzI5NjNhNGQtYjViYy00Y2YxLWI3YmQtZWY5ZjM2M2VjYjViIiwidmlld3MuYWRtaW4iLCJhc3NldC56b25lcy5lNjRkNDA2Ni02OTNjLTRlYmEtOTM3MS0wMDdlYWU2ZjA1M2QiLCJwcmVkaXgtYXNzZXQuem9uZXMuY2VjYjAzM2ItNDQ1Mi00MTc4LWE2NzktNWY1OWE0MzFiNGY1IiwidWFhIiwicHJlZGl4LXNlZWQiLCJwcmVkaXgtYXNzZXQuem9uZXMuZTY0ZDQwNjYtNjkzYy00ZWJhLTkzNzEtMDA3ZWFlNmYwNTNkIiwidmlld3MucG93ZXIiLCJwcmVkaXgtYXNzZXQuem9uZXMuZDUwM2VmZjYtNmIzNS00YmYyLTk1MDItZDkxOThjYjc3M2ViIl19.RqOVpiUz_qElA_ay5AC8Vh0rOcoLpzCw9Ha0rxq55nnalk6Ie904x8QPfp5gUUtvaDMfS231u87w1T2h6xuMA_J-8HL6nq59qBHdtOdzJMjDBFLeMVmylpg8_l7SaFLBP8tikYOj6id86DOpFfSIEQklxpqxMT56MK7eXlhiao7c5TMfQ3ND-GNgKxfEYtEi4_jhuZiIYMaVYZw34DAFx5rb7UzBBoujB8M_792McSn-ftiWY2arBdV-dkVJfcfGBRR9-jKCpe8ICe_o3Do2hyGionyWslhmVvgrkaUJ9i3saFx6hjHyC3WPnCSWiuVGXpzZ90NwMx3MlAHPT6tWjA',
      'Origin': 'http://localhost:8100'
    }
  });

  $scope.socket.on('connect', function () {
    console.log('Connected to websockets');
    socket.emit('my other event', { my: 'data' });
  });

  $scope.init = function(){
    $scope.watch();
  };
  $scope.init();
})

.controller('SettingsCtrl', function($scope) {
  console.log('=========== Loading localStorage =============');
  $scope.timeseriesUrl = localStorage.timeseriesUrl ? localStorage.timeseriesUrl:'';
  $scope.predixZoneId = localStorage.predixZoneId ? localStorage.predixZoneId:'';
  $scope.trustedIssuerId = localStorage.trustedIssuerId ? localStorage.trustedIssuerId:'';
  $scope.clientId = localStorage.clientId ? localStorage.clientId:'';
  $scope.clientSecret = localStorage.clientSecret?localStorage.clientSecret:'';

  $scope.saveLocalStorage = function(){
    console.log('=========== Saving localStorage =============');
    console.log($scope.predixZoneId);
    localStorage.timeseriesUrl = $scope.timeseriesUrl;
    localStorage.predixZoneId = $scope.predixZoneId;
    localStorage.trustedIssuerId = $scope.trustedIssuerId;
    localStorage.clientId = $scope.clientId;
    localStorage.clientSecret = $scope.clientSecret;
  };
});
