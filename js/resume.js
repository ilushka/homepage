var ANIMATION_TYPE = {
    NONE: 0,
    UP:   1,
    DOWN: 2,
};

function AnimeObj(obj) {
    this._obj = obj;                 // object to animate
    this._animeInProgress = false;   // is animation in progress
    this._rate = 1;                  // unit count that is used to modify property per each frame 
    this._intervalId = 0;            // current interval ID
    this._currentAnimation = ANIMATION_TYPE.NONE;    // currenty type of animation

    this.setRate = function(rate) {
        this._rate = Math.abs(rate);
    };

    this.getCurrentType = function() {
        return this._currentAnimation;
    };

    this.stopAnimation = function() {
        clearInterval(this._intervalId);
        this._animeInProgress = false;
        this._currentAnimation = ANIMATION_TYPE.NONE;
    };

    // animate object on Y axis
    this.animateY = function(from, to) {
        var that = this;
        var position = from;
        var directionalRate = 0;

        if (that._animeInProgress === true)
            return;
        that._animeInProgress = true;

        if (from > to) {
            // moving up
            directionalRate = -that._rate;
            that._currentAnimation = ANIMATION_TYPE.UP;
        } else if (from < to) {
            // movinf down
            directionalRate = that._rate;
            that._currentAnimation = ANIMATION_TYPE.DOWN;
        } else {
            // stay in the same place
            that.stopAnimation();
            return;
        }

        that._obj.style.top = position + "px";
        that._intervalId = setInterval(animateYFrame, 5);

        // per frame function 
        function animateYFrame() {
            if (position === to) {
                // animation is complete
                that.stopAnimation();
            } else {
                // keep moving object
                var delta = to - position;
                if (Math.abs(delta) < that._rate) {
                    // leftover distance is smaller than the rate
                    position += delta;
                } else {
                    position += directionalRate;
                }
                that._obj.style.top = position + "px";
            } 
        }
    };

}

// execute func when event stream stops for "timeout" milliseconds or recieves "rate" events 
var throttleFunc = function(rate, timeout, func) {
    var toId = 0;
    var eventCount = 0;
    return function(e) {
        if (eventCount === 0) {
            func();
        }
        eventCount++;
        if (eventCount === rate) {
            eventCount = 0;
            console.log("eventCount");
        }
        clearTimeout(toId);
        toId = setTimeout(function() {console.log("timeout");eventCount = 0;}, timeout);
    }
};

window.addEventListener("load", function(event) {
    var EVENT_THROTTLE_RATE = 100;

    var popupAnime = new AnimeObj(document.getElementById("popup"));
    popupAnime.setRate(18);
    var throttledScrollUp = throttleFunc(EVENT_THROTTLE_RATE, 100, function() {
        if (popupAnime.getCurrentType() === ANIMATION_TYPE.DOWN) {
            popupAnime.stopAnimation();
        }
        popupAnime.animateY(window.innerHeight, 30);
    });
    var throttledScrollDown = throttleFunc(EVENT_THROTTLE_RATE, 100, function() {
        if (popupAnime.getCurrentType() === ANIMATION_TYPE.UP) {
            popupAnime.stopAnimation();
        }
        popupAnime.animateY(30, window.innerHeight);
    });

    document.onkeydown = function(e) {
        e.preventDefault();
        console.log(e);
        throttledScrollUp();
    };

    window.onmousewheel = window.onwheel = function(e) {
        e.preventDefault();
        console.log(e);
        if (e.deltaY > 0) {
            // scrolling down
            throttledScrollDown();
        } else {
            // scrolling up
            throttledScrollUp();
        }
    };
}, false);

