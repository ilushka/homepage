var ANIMATION_TYPE = {
    NONE: 0,
    UP:   1,
    DOWN: 2,
};

function AnimateY(obj, from, to, rate) {
    this._obj = obj;
    this._position = from;
    this._to = to;
    this._isComplete = false;
    if (from > to) {
        this._rate = -rate;
    } else if (from < to) {
        this._rate = rate;
    } else {
        this._rate = 0;
    }

    this.isComplete = function() {
        return this._isComplete;
    };

    this.drawFrame = function() {
        var delta = 0;
        if (this._isComplete === true) {
            return;
        }
        delta = this._to - this._position;
        if (Math.abs(delta) < Math.abs(this._rate)) {
            // leftover distance is smaller than the rate
            this._position += delta;
        } else {
            this._position += this._rate;;
        }
        this._obj.style.top = this._position + "px";
        if (this._position === this._to) {
            this._isComplete = true;
        }
    };
} 

function AnimateOpacity(obj, from, to, rate) {
    this._obj = obj;
    this._opacity = from;
    this._to = to;
    this._isComplete = false;
    if (from > to) {
        this._rate = -rate;
    } else if (from < to) {
        this._rate = rate;
    } else {
        this._rate = 0;
    }

    this.isComplete = function() {
        return this._isComplete;
    };

    this.drawFrame = function() {
        var delta = 0;
        if (this._isComplete === true) {
            return;
        }
        delta = this._to - this._opacity;
        if (Math.abs(delta) < Math.abs(this._rate)) {
            // leftover opacity is smaller than the rate
            this._opacity += delta;
        } else {
            this._opacity += this._rate;;
        }
        this._opacity = Math.round(this._opacity * 1000) / 1000;
        this._obj.style.opacity = this._opacity;
        if (this._opacity === this._to) {
            this._isComplete = true;
        }
    };
}

function AnimeObj(obj) {
    this._obj = obj;                  // object to animate
    this._animeInProgress = false;    // is animation in progress
    this._intervalId = 0;             // current interval ID
//    this._currentAnimation = ANIMATION_TYPE.NONE;    // currenty type of animation
    this._animationQueue = [];
    this._completionFunc = null;

/*
    this.getCurrentType = function() {
        return this._currentAnimation;
    };
*/

    this.animationInProgress = function() {
        return this._animeInProgress;
    };

    this.stopAnimation = function() {
        clearInterval(this._intervalId);
        this._animeInProgress = false;
//        this._currentAnimation = ANIMATION_TYPE.NONE;
    };

    this.start = function() {
        var that = this;

        if (this._animeInProgress === true) {
            return;
        }
        this._animeInProgress = true;
        this._intervalId = setInterval(frameDrawer, 5);

        // per frame function 
        function frameDrawer() {
            if (that._animationQueue.length === 0) {
                // we are done with all animations in queue
                that.stopAnimation();
                if (that._completionFunc !== null) {
                    that._completionFunc();
                    that._completionFunc = null;
                }
                return;
            }
            for (var ii = 0; ii < that._animationQueue.length; ii++) {
                if (that._animationQueue[ii].isComplete() === false) {
                    that._animationQueue[ii].drawFrame();
                } else {
                    // this particular animation is complete
                    that._animationQueue.splice(ii, 1);
                }
            }
        }
    };

    // animate object on Y axis
    this.animateY = function(from, to, rate) {
        if (this._animeInProgress === true) {
            return this;
        }
        this._animationQueue.push(new AnimateY(this._obj, from, to, rate));
        return this;
    };

    // set animation completion callback
    this.completion = function(func) {
        this._completionFunc = func;
        return this;
    };

    // animate object's opacity
    this.animateOpacity = function(from, to, rate) {
        if (this._animeInProgress === true) {
            return this;
        }
        this._animationQueue.push(new AnimateOpacity(this._obj, from, to, rate));
        return this;
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

// create HTML object from string
var createHtml = function(html) {
    var template = document.createElement("template");
    template.innerHTML = html;
    return template.content.firstChild;
};

// circular doubly-linked list of popup content
function PopupList() {
    this._list = [];
    this._index = 0;
    this.addPopup = function(obj) {
        this._list.push(obj);
    };
    this.getNextPopup = function() {
        if (++this._index == this._list.length) {
            this._index = 0;
        }
        var obj = this._list[this._index];
        return obj;
    };
    this.getPrevPopup = function() {
        if (--this._index < 0) {
            this._index = (this._list.length - 1);
        }
        var obj = this._list[this._index];
        return obj;
    };
}

window.addEventListener("load", function(event) {
    var EVENT_THROTTLE_RATE = 45;
    var DEBOUNCE_DELAY  = 100;

    var popupList = new PopupList();
    popupList.addPopup(createHtml("<div>1</div>"));
    popupList.addPopup(createHtml("<div>2</div>"));
    popupList.addPopup(createHtml("<div>3</div>"));
    popupList.addPopup(createHtml("<div>4</div>"));
    popupList.addPopup(createHtml("<div>5</div>"));

    var visiblePopup = document.getElementById("popup1");
    var invisiblePopup = document.getElementById("popup2");
    var visPopupAnime = new AnimeObj(visiblePopup);
    var invisPopupAnime = new AnimeObj(invisiblePopup);
    var switchPopups = function() {
        [visiblePopup, visPopupAnime, invisiblePopup, invisPopupAnime] =
                [invisiblePopup, invisPopupAnime, visiblePopup, visPopupAnime];
    };
    var throttledScrollUp = throttleFunc(EVENT_THROTTLE_RATE, DEBOUNCE_DELAY, function() {
        if (visPopupAnime.animationInProgress() || invisPopupAnime.animationInProgress()) {
            return;
        }
        invisiblePopup.replaceChild(popupList.getNextPopup(), invisiblePopup.childNodes[0]);
        visPopupAnime.animateY(100, 0, 10).animateOpacity(1.0, 0.0, 0.05).start();
        invisPopupAnime.animateY(300, 100, 10).animateOpacity(0.0, 1.0, 0.1).start();
        switchPopups();
/*
        visPopupAnime.animateY(100, 0, 10).animateOpacity(1.0, 0.0, 0.05)
            .completion(function() {
                invisPopupAnime.animateY(300, 100, 10).animateOpacity(0.0, 1.0, 0.1).start();
                switchPopups();
            }).start();
*/
    });
    var throttledScrollDown = throttleFunc(EVENT_THROTTLE_RATE, DEBOUNCE_DELAY, function() {
        if (visPopupAnime.animationInProgress() || invisPopupAnime.animationInProgress()) {
            return;
        }
        invisiblePopup.replaceChild(popupList.getPrevPopup(), invisiblePopup.childNodes[0]);
        visPopupAnime.animateY(100, 300, 10).animateOpacity(1.0, 0.0, 0.05).start();
        invisPopupAnime.animateY(0, 100, 5).animateOpacity(0.0, 1.0, 0.1).start();
        switchPopups();
/*
        visPopupAnime.animateY(100, 300, 10).animateOpacity(1.0, 0.0, 0.05)
            .completion(function() {
                invisPopupAnime.animateY(0, 100, 5).animateOpacity(0.0, 1.0, 0.1).start();
                switchPopups();
            }).start();
*/
    });


/* MONKEY:
    document.onkeydown = function(e) {
        e.preventDefault();
        console.log(e);
        throttledScrollUp();
    };
*/

//    window.onmousewheel = window.onwheel = function(e) {
    var lastDeltaY = 0;
    window.onmousewheel = function(e) {
        e.preventDefault();
        console.log(e);
        // NOTE: we want to react only to accelerating events. this is especially important for
        // macbook touchpad because it generates a lot of events that first accelerate then slow
        // down. by doing this we can detect another acceleration while the scrolling is still decelerating.
        // we set throttling event count that is equal to max number of accelerating events in one
        // touchpad slide. combined with short debounce timeout we'll detect all accelerating events,
        // then timeout, and then will be ready to detect another acceleration/touchpad slide. of course,
        // if another acceleration happens while we still accelerating from previous slide we won't detect
        // it until throttling event count is reached.
        if (Math.abs(e.deltaY) > lastDeltaY) {
            if (e.deltaY > 0) {
                // scrolling down
                throttledScrollDown();
            } else if (e.deltaY != -0) {
                // scrolling up
                throttledScrollUp();
            }
        }
        lastDeltaY = Math.abs(e.deltaY);
    };
}, false);

