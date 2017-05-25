angular.module('starter.controllers', [])

.controller('AppCtrl', function($scope, $ionicModal, $timeout) {

  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //$scope.$on('$ionicView.enter', function(e) {
  //});
})

.controller('SensorsCtrl', function($scope, $rootScope, $http) {
  console.log('SensorsCtrl called');
  $scope.watching = false;
  $scope.logs = [];
  $scope.connectionStatus = 'Disconnected';
  document.addEventListener("deviceready", onDeviceReady, false);
  function onDeviceReady() {
      $scope.device = device;
  }

  // Settings
  console.log('=========== Loading localStorage =============');
  $scope.timeseriesUrl = localStorage.timeseriesUrl ? localStorage.timeseriesUrl:'wss://gateway-predix-data-services.run.aws-usw02-pr.ice.predix.io/v1/stream/messages';
  $scope.predixZoneId = localStorage.predixZoneId ? localStorage.predixZoneId:'';
  $scope.trustedIssuerId = localStorage.trustedIssuerId ? localStorage.trustedIssuerId:'';
  $scope.clientId = localStorage.clientId ? localStorage.clientId:'';
  $scope.clientSecret = localStorage.clientSecret?localStorage.clientSecret:'';
  $scope.accessTokenJSON = JSON.parse(localStorage.accessTokenJSON?localStorage.accessTokenJSON:'{}');
  $scope.interval = localStorage.interval?localStorage.interval:500;

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

      $scope.timer = setInterval(function(){
        if($scope.socket && $scope.socket.readyState === 1 && $scope.socketInfo){
          var date = (new Date()).getTime();
          var requestBody = {
            socketId: $scope.socketInfo.socketId,
            messageId: date,
            body:[]
          };

          if($scope.status){
            requestBody.body.push($scope.buildData('battery', date, $scope.status.level));
            requestBody.body.push($scope.buildData('pluggedIn', date, $scope.status.isPlugged));
          };

          if($scope.acceleration){
            requestBody.body.push($scope.buildData('acceleration-x', date, $scope.acceleration.x));
            requestBody.body.push($scope.buildData('acceleration-y', date, $scope.acceleration.y));
            requestBody.body.push($scope.buildData('acceleration-z', date, $scope.acceleration.z));
          };

          if($scope.heading){
            requestBody.body.push($scope.buildData('direction', date, $scope.heading.magneticHeading));
          };

          if($scope.position){
            requestBody.body.push($scope.buildData('latitude', date, $scope.position.coords.latitude));
            requestBody.body.push($scope.buildData('longitude', date, $scope.position.coords.longitude));
          };

          console.log('=============== Sending data ================');
          console.log(JSON.stringify(requestBody));
          $scope.socket.send(JSON.stringify(requestBody));
        }
      }, $scope.interval);
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
      clearInterval($scope.timer);
    }
    $scope.watching = !$scope.watching;
  };

  $scope.buildData = function(tagName, date, value){
    return {
      name: tagName,
      datapoints: [
        [date, value, 2]
      ],
      attributes:device
    };
  };

  $scope.connect = function(){
    if(!$scope.socketInfo){
      $scope.connectionStatus = 'Connecting';
      console.log(JSON.stringify({
        method: 'GET',
        url: 'https://predix-proxy.run.aws-usw02-pr.ice.predix.io/open-ws',
        headers:{
          'Authorization': $scope.accessTokenJSON.token_type + ' ' + $scope.accessTokenJSON.access_token,
          'Predix-Zone-Id': $scope.predixZoneId,
          'X-Endpoint': $scope.timeseriesUrl
        }
      }));
      $http({
        method: 'GET',
        url: 'https://predix-proxy.run.aws-usw02-pr.ice.predix.io/open-ws',
        headers:{
          'Authorization': $scope.accessTokenJSON.token_type + ' ' + $scope.accessTokenJSON.access_token,
          'Predix-Zone-Id': $scope.predixZoneId,
          'X-Endpoint': $scope.timeseriesUrl
        }
      }).then(function successCallback(response) {
        if(response.data.readyState === 'OPEN'){
          $scope.socketInfo = response.data;
          $scope.openWebsocket();
          $scope.connectionStatus = 'Connected';
        } else{
          $scope.connectionStatus = 'Disconnected';
          $scope.logs.push({date:(new Date()).toLocaleString(), message: 'Error connecting to Time Series service.'});
        }
      }, function errorCallback(response) {
        $scope.connectionStatus = 'Disconnected';
        console.log(JSON.stringify(response));
        $scope.logs.push({date:(new Date()).toLocaleString(), message: 'Error connecting to Time Series service.'});
      });
    } else{
      $scope.connectionStatus = 'Disconnecting';
      $http({
        method: 'GET',
        url: 'https://predix-proxy.run.aws-usw02-pr.ice.predix.io/close-ws',
        headers:{
          'X-SocketId': $scope.socketInfo.socketId
        }
      }).then(function successCallback(response) {
        $scope.connectionStatus = 'Disconnected';
        delete $scope.socketInfo;
        $scope.logs.push({date:(new Date()).toLocaleString(), message: 'Disconnected from Time Series service.'});
      }, function errorCallback(response) {
        $scope.connectionStatus = 'Error disconnecting';
        $scope.logs.push({date:(new Date()).toLocaleString(), message: 'Error disconnecting from Time Series service.'});
      });
    }
  };

  $scope.openWebsocket = function(){
    $scope.wsProxyUrl = 'wss://predix-proxy.run.aws-usw02-pr.ice.predix.io';
    // actually open the socket here!
    $scope.socket = new WebSocket($scope.wsProxyUrl);

    $scope.socket.onopen = function() {
      console.log('ws proxy socket open.');
      // need to send socket ID, to bind client socket to back end socket.
      // TODO: fix this!  it's ugly for time series ingestion.
      $scope.socket.send(JSON.stringify({socketId: $scope.socketInfo.socketId, handshake: true}));
    };

    $scope.socket.onmessage = function(evt) {
      console.log('message received: ' + evt.data);
      $scope.restResponse = evt.data + '\n' + $scope.restResponse;
      // socket.close();
    };
    $scope.socket.onerror = function(err) {
      console.log('error from ws proxy');
      $scope.error = JSON.stringify(err);
      $scope.socket.close();
    };
  };

  window.addEventListener("batterystatus", onBatteryStatus, false);

  function onBatteryStatus(status) {
    $scope.status = status;
  }

  $scope.init = function(){
    $scope.watch();
  };

  $scope.init();
})

.controller('SettingsCtrl', function($scope, $http) {
  $scope.logs = [];
  document.addEventListener("deviceready", onDeviceReady, false);
  function onDeviceReady() {
      $scope.device = device;
  }

  console.log('=========== Loading localStorage =============');
  $scope.timeseriesUrl = localStorage.timeseriesUrl ? localStorage.timeseriesUrl:'wss://gateway-predix-data-services.run.aws-usw02-pr.ice.predix.io/v1/stream/messages';
  $scope.predixZoneId = localStorage.predixZoneId ? localStorage.predixZoneId:'';
  $scope.trustedIssuerId = localStorage.trustedIssuerId ? localStorage.trustedIssuerId:'';
  $scope.clientId = localStorage.clientId ? localStorage.clientId:'';
  $scope.clientSecret = localStorage.clientSecret?localStorage.clientSecret:'';
  $scope.accessTokenJSON = JSON.parse(localStorage.accessTokenJSON?localStorage.accessTokenJSON:'{}');
  $scope.refreshInterval = localStorage.interval?localStorage.interval:500;

  $scope.saveLocalStorage = function(){
    console.log('=========== Saving localStorage =============');
    console.log($scope.predixZoneId);
    localStorage.timeseriesUrl = $scope.timeseriesUrl;
    localStorage.predixZoneId = $scope.predixZoneId;
    localStorage.trustedIssuerId = $scope.trustedIssuerId;
    localStorage.clientId = $scope.clientId;
    localStorage.clientSecret = $scope.clientSecret;
    localStorage.refreshInterval = $scope.refreshInterval;
  };

  $scope.getToken = function(){
    $http({
      method: 'POST',
      url: 'https://predix-proxy.run.aws-usw02-pr.ice.predix.io/uaalogin',
      headers:{
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': 'Basic ' + btoa($scope.clientId + ':' + $scope.clientSecret)
      },
      data: 'uaaUrlInput=' + encodeURIComponent($scope.trustedIssuerId) + '&grant_type=client_credentials'
    }).then(function successCallback(response) {
      response.data.expiration = new Date();
      response.data.expiration.setSeconds(response.data.expiration.getSeconds() + response.data.expires_in);
      localStorage.accessTokenJSON = JSON.stringify(response.data);
      $scope.accessTokenJSON = response.data;
      var accessTokenParts = $scope.accessTokenJSON.access_token.split('.');
      $scope.decryptedToken = JSON.parse(atob(accessTokenParts[1]));
      $scope.logs.push({date:(new Date()).toLocaleString(), message: 'Successfully retrieved token.'});
      $scope.$apply();
    }, function errorCallback(response) {
      console.log(JSON.stringify(response));
      $scope.logs.push({date:(new Date()).toLocaleString(), message: 'Error getting token.'});
      $scope.$apply();
    });
  };
});
