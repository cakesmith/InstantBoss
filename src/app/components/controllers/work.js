(function (work) {

  work.controller('WorkCtrl', function ($scope, Timer, $modal) {

    var workTimer, breakTimer;

    $scope.work = 10;
    $scope.break = 2;
    $scope.cycles = 5;

    $scope.totalWork = 0;
    $scope.totalWorkToDate = 0;

    $scope.totalBreak = 0;
    $scope.totalBreakToDate = 0;

    $scope.working = false;
    $scope.breaking = false;

    function minutes(min) {
      return min * 60 * 1000;
    }


    function takeABreakModal() {

      var breakModalInstanceCtrl = function ($scope, $modalInstance) {

        $scope.takeBreak = function () {
          $modalInstance.close($scope.takeBreak);
        };
        $scope.workLonger = function () {
          $modalInstance.close($scope.workLonger);
        };
        $scope.skipBreak = function () {
          $modalInstance.close($scope.skipBreak);
        };
        $scope.dismiss = function () {
          $modalInstance.dismiss('cancel');
        }

      };

      $scope.breakModalInstance = $modal.open({
        templateUrl: '',
        controller : breakModalInstanceCtrl,
        size       : 'lg'
      });

      $scope.breakModalInstance.result.then(function (returnFn) {
        returnFn();
      }, function (cancelFn) {
        cancelFn();
      });

    }

    function backToWorkModal() {

      var workModalInstanceCtrl = function ($scope, $modalInstance) {

        $scope.workNow = function () {
          $modalInstance.close('workNow');
        };

        $scope.breakLonger = function () {
          $modalInstance.$close('breakLonger')
        };

        $scope.dismiss = function () {
          $modalInstance.dismiss('cancel');
        };

      };

      $scope.workModalInstance = $modal.open({
        templateUrl: '',
        controller : workModalInstanceCtrl,
        size       : 'lg'
      });

      $scope.workModalInstance.result.then(function (returnFn) {
        returnFn();
      }, function (cancelFn) {
        cancelFn();
      });


    }

    function watchTimer(timer, elapsedFn) {
      $scope.$watch(function () {
        return calculateTimeCompleted(timer);
      }, function (newVal, oldVal) {

        var elapsed = newVal === oldVal ? newVal : newVal - oldVal;
        elapsedFn(elapsed);
      });

    }

    function calculateTimeCompleted(timer) {
      var now = Date.now();
      var started = timer.get('started');
      var paused = timer.get('paused');
      return now - started - paused;
    }

    $scope.reset = function () {
      $scope.work = 10;
      $scope.break = 2;
      $scope.cycles = 5;
    };

    $scope.start = function (time) {

      time = time ? time : (($scope.cycles > 0) ? minutes($scope.work) : -1);

      workTimer = new Timer(time);

      workTimer.start().then(function () {
        $scope.working = false;
        takeABreakModal();
      });

      watchTimer(workTimer, function (elapsed) {
        $scope.totalWork += elapsed;
        $scope.totalWorkToDate += elapsed;
      });


      $scope.working = true;
    };

    $scope.pause = function () {

      $scope.working = !$scope.working;

      if (angular.isDefined(workTimer)) {
        workTimer.pause();
      }

    };

    $scope.workLonger = function() {
      $scope.start(-1);

    };

    $scope.takeBreak = function () {

      breakTimer = new Timer(minutes($scope.break));

      breakTimer.start().then(function () {
        $scope.breaking = false;
        backToWorkModal();
      });

      watchTimer(breakTimer, function (elapsed) {
        $scope.totalBreak += elapsed;
        $scope.totalBreakToDate += elapsed;
      });

      $scope.breaking = true;
    };

    $scope.skipBreak = function () {

    };

  });

}(angular.module('boss.work', [
  'boss.timer',
  'ui.bootstrap'
])));