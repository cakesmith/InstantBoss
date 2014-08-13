describe('timer service', function () {

  'use strict';

  var TimerService, timer, $timeout, time, flush;

  function tick(num) {
    time = time + num;
  }

  beforeEach(module('boss.timer'));

  beforeEach(inject(function (Timer, _$timeout_) {
    TimerService = Timer;
    timer = new TimerService();

    $timeout = _$timeout_;
    time = Date.now();

    flush = function(msec) {
      tick(msec);
      $timeout.flush(msec);
    };

    spyOn(Date, 'now').and.callFake(function() {
      return time;
    });

  }));

  afterEach(function () {
    $timeout.verifyNoPendingTasks();
  });

  it('should have sanity', function () {
    expect(timer).not.toBeUndefined;
  });

  it('should count down', function (done) {

    var result = false;

    timer.start(2000).then(function () {
      result = true;
    });

    flush(1999);
    expect(result).toBe(false);
    flush(1);
    expect(result).toBe(true);
    done();
  });

  it('should pause the countdown', function (done) {

    var result = false;

    timer.start(2000).then(function () {
      result = true;
    });

    flush(1000);
    expect(result).toBe(false);

    timer.pause();
    expect(result).toBe(false);

    flush(2000);
    expect(result).toBe(false);

    timer.pause();
    expect(result).toBe(false);

    flush(999);
    expect(result).toBe(false);

    flush(1);
    expect(result).toBe(true);

    done();

  });

  it('should pause more than once', function(done) {

    var result = false;

    timer.start(2000).then(function(value) {
      result = true;
    });

    expect(result).toBe(false);

    flush(1000);
    expect(result).toBe(false);

    timer.pause();
    expect(result).toBe(false);

    flush(2000);
    expect(result).toBe(false);

    timer.pause();
    expect(result).toBe(false);

    flush(500);
    expect(result).toBe(false);

    timer.pause();
    expect(result).toBe(false);

    flush(2000);
    expect(result).toBe(false);

    timer.pause();
    expect(result).toBe(false);

    flush(499);
    expect(result).toBe(false);

    flush(1);
    expect(result).toBe(true);

    done();

  });

  it('should never resolve when given a negative value', function(done) {

    var result = false;

    timer.start(-1).then(function(value) {
      result = true;
    });
    expect(result).toBe(false);

    flush(1000);
    expect(result).toBe(false);

    // 10,000 days
    flush(10000 * 24 * 60 * 60 * 1000);
    expect(result).toBe(false);

    timer.pause();
    expect(result).toBe(false);

    flush(10000);
    expect(result).toBe(false);

    timer.pause();
    expect(result).toBe(false);

    // 10,000 years
    flush(10000 * 365 * 24 * 60 * 60 * 1000);
    expect(result).toBe(false);

    done();


  });

  it('should not blow up if paused before starting', function(done) {

    var result = false;

    timer.pause();
    timer.pause();
    timer.pause();

    timer.start(2000).then(function() {
      result = true;
    });

    expect(result).toBe(false);
    flush(2000);
    expect(result).toBe(true);

done();

  });

  it('should provide some info about itself', function(done) {

    var result = false;
    var now = Date.now();


    timer.start(2000).then(function() {
      result = true;
    });

    expect(result).toBe(false);
    expect(timer.get('started')).toBe(now);
    expect(timer.get('paused')).toBe(0);
    expect(timer.get('remaining')).toBe(2000);

     flush(1000);

    expect(result).toBe(false);
    expect(timer.get('started')).toBe(now);
    expect(timer.get('paused')).toBe(0);
    expect(timer.get('remaining')).toBe(1000);

     // Pause
    timer.pause();
    flush(500);

    expect(timer.get('started')).toBe(now);
    expect(timer.get('paused')).toBe(500);
    expect(timer.get('remaining')).toBe(1000);


    flush(500);
    expect(timer.get('started')).toBe(now);
    expect(timer.get('paused')).toBe(1000);
    expect(timer.get('remaining')).toBe(1000);

    // Resume
    timer.pause();
    flush(500);

    expect(timer.get('started')).toBe(now);
    expect(timer.get('paused')).toBe(1000);
    expect(timer.get('remaining')).toBe(500);

    // Pause
    timer.pause();
    flush(500);

    expect(timer.get('started')).toBe(now);
    expect(timer.get('paused')).toBe(1500);


    // Resume
    timer.pause();
    flush(500);

    expect(timer.get('started')).toBe(now);
    expect(timer.get('paused')).toBe(1500);
    expect(timer.get('remaining')).toBe(0);

    expect(result).toBe(true);

    done();

  });

  it('should not blow up if queried before starting', function(done) {

    var result = false;
    var now = Date.now();

    expect(timer.get('started')).toBe(0);
    expect(timer.get('paused')).toBe(0);
    expect(timer.get('remaining')).toBe(0);

    var newTimer = new TimerService(2000);

    expect(newTimer.get('started')).toBe(0);
    expect(newTimer.get('paused')).toBe(0);
    expect(newTimer.get('remaining')).toBe(2000);

    timer.start(2000).then(function() {
      result = true;
    });

    expect(timer.get('started')).toBe(now);
    expect(timer.get('paused')).toBe(0);
    expect(timer.get('remaining')).toBe(2000);

    $timeout.flush();

    done();


  });



});