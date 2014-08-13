(function (timer) {
  'use strict';

  timer.factory('Timer', function ($q, $timeout) {

    var timeStarted, deferred, timerPromise, countdownTime, timeRemaining, pauseData, time;

    function Timer(countdown) {
      time = countdown ? countdown : 0;
    }

    function calculatePaused() {

      var now = Date.now();

      var totalPausedTime = 0;

      angular.forEach(pauseData, function (event) {
          totalPausedTime += event.paused ? now - event.time : 0;
          now = event.time;
      });

      return totalPausedTime;
    }

    function calculateRemaining() {

      var now = Date.now();

      var timeElapsed = now - timeStarted;
      return countdownTime - timeElapsed + calculatePaused();

    }

    Timer.prototype.start = function (countdown) {

      time = countdown ? countdown : time;

      timeStarted = Date.now();

      deferred = $q.defer();
      pauseData = [
        {paused: false, time: timeStarted}
      ];

      if (time < 0) {

        timeRemaining = -1;
        return(deferred.promise);

      } else {

        timeRemaining = countdownTime = time;
        timerPromise = $timeout(function () {
          deferred.resolve();
        }, timeRemaining);

        return deferred.promise;
      }
    };

    Timer.prototype.pause = function () {

      if (timeStarted) {
        var now = Date.now();

        var isPaused = pauseData[0]['paused'];
        var timeElapsed = now - pauseData[0]['time'];

        if (timeRemaining >= 0) {

          if (isPaused) {

            timerPromise = $timeout(function () {
              deferred.resolve();
            }, timeRemaining);

          } else {

            timeRemaining = timeRemaining - timeElapsed;
            $timeout.cancel(timerPromise);

          }
        }

        pauseData.unshift({paused: !isPaused, time: now});

      }
    };

    Timer.prototype.get = function (opt) {

      // in case we haven't start()'ed yet
      if(!timeRemaining) {
        switch (opt) {
          case 'remaining':
            return time;
        }
        return 0;
      }

      switch (opt) {

        case 'remaining':
          return calculateRemaining();
        case 'started':
          return timeStarted;
        case 'paused':
          return calculatePaused();
      }

    };

    return Timer;

  });

}(angular.module('boss.timer', [])));