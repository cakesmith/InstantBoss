describe('work controller', function () {
  'use strict';

  beforeEach(module('boss.work'));
  beforeEach(module('ui.bootstrap'));


  var $modal, $scope, $interval, $timeout, flush, time;


  function seconds(sec) {
    return sec * 1000;
  }

  function minutes(min) {
    return 60 * seconds(min);
  }

  beforeEach(inject(function (_$modal_, _$timeout_, _$interval_, $rootScope, $controller) {

    $interval = _$interval_;
    $timeout = _$timeout_;
    $modal = _$modal_;

    var fakeModal = {
      result : {
        then: function (confirmCallback, cancelCallback) {
          //Store the callbacks for later when the user clicks on the OK or Cancel button of the dialog
          this.confirmCallBack = confirmCallback;
          this.cancelCallback = cancelCallback;
        }
      },
      close  : function (item) {
        //The user clicked OK on the modal dialog, call the stored confirm callback with the selected item
        this.result.confirmCallBack(item);
      },
      dismiss: function (type) {
        //The user clicked cancel on the modal dialog, call the stored cancel callback
        this.result.cancelCallback(type);
      }
    };

    spyOn($modal, 'open').and.returnValue(fakeModal);

    time = Date.now();

    flush = function (msec) {
      time = time + msec;
      $interval.flush(msec);
      $timeout.flush(msec);
    };

    spyOn(Date, 'now').and.callFake(function () {
      return time;
    });


    $scope = $rootScope.$new();
    $controller('WorkCtrl', {$scope: $scope});


  }));

  afterEach(function () {
    $timeout.verifyNoPendingTasks();
  });


  it('should have sanity', function () {
    expect($scope).not.toBeUndefined();
  });

  it('should set the defaults', function () {
    expect($scope.work).toBe(10);
    expect($scope.break).toBe(2);
    expect($scope.totalWork).toBe(0);
    expect($scope.totalWorkToDate).toBe(0);
    expect($scope.totalBreak).toBe(0);
    expect($scope.totalBreakToDate).toBe(0);
    expect($scope.cycles).toBe(5);
  });

  it('should start working', function () {

    var time = seconds(1);

    $scope.start();

    flush(time);
    $scope.$digest();

    expect($scope.totalWork).toEqual(time);
    expect($scope.totalWorkToDate).toEqual(time);

    // Flush $timeout to finish test because workTimer has been started
    // but we're not checking that just yet.
    $timeout.flush();

  });

  it('should work for specified time', function () {

    // These values are kept intentionally small to facilitate
    // faster testing.
    //
    // $interval is called many more times when using
    // $interval.flush(), making it much slower than
    // $timeout.flush()

    var workTime = $scope.work = .2; // 10 seconds

    var workMsec = minutes(workTime);

    expect($scope.working).toBe(false);

    $scope.start();
    flush(workMsec - 100);
    $scope.$digest();

    expect($scope.totalWork).toEqual(workMsec - 100);
    expect($scope.working).toBe(true);

    flush(90);
    $scope.$digest();

    expect($scope.totalWork).toEqual(workMsec - 10);
    expect($scope.working).toBe(true);

    flush(10);
    $scope.$digest();

    expect($scope.totalWork).toEqual(workMsec);
    expect($scope.working).toBe(false);

  });

  it('should do indefinite work if no more cycles remain', function () {

    $scope.cycles = 0;

    expect($scope.working).toBe(false);

    $scope.start();
    flush(1000);
    $scope.$digest();

    expect($scope.working).toBe(true);

    flush(1000);

    expect($scope.working).toBe(true);


  });

  it('should pause and unpause the work timer', function () {

    var workTime = $scope.work = .2; // 10 seconds

    var workMsec = minutes(workTime);

    expect($scope.working).toBe(false);

    $scope.start();
    flush(workMsec - 100);
    $scope.$digest();

    expect($scope.working).toBe(true);

    expect($scope.totalWork).toBe(workMsec - 100);

    $scope.pause();

    expect($scope.working).toBe(false);

    flush(2000);
    $scope.$digest();

    expect($scope.working).toBe(false);

    expect($scope.totalWork).toBe(workMsec - 100);

    $scope.pause();

    expect($scope.working).toBe(true);

    flush(50);
    $scope.$digest();

    expect($scope.working).toBe(true);
    expect($scope.totalWork).toBe(workMsec - 50);

    flush(49);
    $scope.$digest();
    expect($scope.working).toBe(true);
    expect($scope.totalWork).toBe(workMsec - 1);

    flush(1);
    $scope.$digest();

    expect($scope.working).toBe(false);
    expect($scope.totalWork).toBe(workMsec);


  });




  describe('takeABreakModal', function () {

    beforeEach(function () {

      // Complete a work cycle

      var workTime = $scope.work = 0.2; // 10 seconds

      var workMsec = minutes(workTime);

      expect($scope.working).toBe(false);

      $scope.start();
      flush(workMsec - 100);
      $scope.$digest();

      expect($scope.working).toBe(true);

      flush(100);
      expect($scope.working).toBe(false);

    });

    it('should call the modal after a work cycle is completed', function () {
      expect($modal.open).toHaveBeenCalled();
    });

    describe('Modal Options', function () {

      it('should call the work longer function when selected', function () {

        spyOn($scope, 'workLonger').and.callThrough();

        $scope.breakModalInstance.close($scope.workLonger);

        expect($scope.workLonger).toHaveBeenCalled();


      });

      it('should call the break function when selected', function () {

        spyOn($scope, 'takeBreak').and.callThrough();

        $scope.breakModalInstance.close($scope.takeBreak);

        expect($scope.takeBreak).toHaveBeenCalled();

        $timeout.flush();

      });

      it('should call the skip break function when selected', function() {

        spyOn($scope, 'skipBreak').and.callThrough();

        $scope.breakModalInstance.close($scope.skipBreak);

        expect($scope.skipBreak).toHaveBeenCalled();

      });

    });

    describe('Functions', function() {

      it('Take a break now', function () {
        var breakTime = $scope.break = 0.1;

        var breakMsec = minutes(breakTime);

        expect($scope.totalBreak).toBe(0);
        expect($scope.totalBreakToDate).toBe(0);

        $scope.takeBreak();

        expect($scope.breaking).toBe(true);

        flush(breakMsec - 100);
        $scope.$digest();

        expect($scope.totalBreak).toBe(breakMsec - 100);
        expect($scope.totalBreakToDate).toBe(breakMsec - 100);

        expect($scope.breaking).toBe(true);

        flush(50);
        $scope.$digest();

        expect($scope.totalBreak).toBe(breakMsec - 50);
        expect($scope.totalBreakToDate).toBe(breakMsec - 50);

        expect($scope.breaking).toBe(true);

        flush(50);
        $scope.$digest();

        expect($scope.totalBreak).toBe(breakMsec);
        expect($scope.totalBreakToDate).toBe(breakMsec);

        expect($scope.breaking).toBe(false);


      });

      it('Work longer', function() {

      });

      it('Skip break', function() {

      });

      it('Cancel', function() {


      });




    });
  });
});
