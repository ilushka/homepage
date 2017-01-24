function AnimateBase(obj, from, to, rate) {
    this._obj = obj;
    this._current = from;
    this._to = to;
    this._isComplete = false;
    if (from > to) {
        this._rate = -rate;
    } else if (from < to) {
        this._rate = rate;
    } else {
        this._rate = 0;
    }

    // this animation is complete, or not
    this.isComplete = function() {
        return this._isComplete;
    };

    // overwrite this method when subclassing
    this.drawFrame = function() {
        throw new Error("Not implemented!");
    };

    this.calcAndDrawFrame = function() {
        var delta = 0;
        if (this._isComplete === true) {
            return;
        }
        delta = this._to - this._position;
        if (Math.abs(delta) < Math.abs(this._rate)) {
            // leftover distance is smaller than the rate
            this._current += delta;
        } else {
            this._current += this._rate;;
        }
        this.drawFrame();
        if (this._current === this._to) {
            this._isComplete = true;
        }
    };

}

// animate object on Y axis
function AnimateY(obj, from, to, rate) {
    AnimateBase.apply(this, [obj, from, to, rate]);
    this.drawFrame = function() {
        this._obj.style.top = this._current + "px";
    };
} 
AnimateY.prototype = Object.create(AnimateBase.prototype, {
    "constructor":  AnimateY
});

// animate object's opacity
function AnimateOpacity(obj, from, to, rate) {
    AnimateBase.apply(this, [obj, from, to, rate]);
    this.drawFrame = function() {
        this._current = Math.round(this._current * 1000) / 1000;    // round to 3 decimal places
        this._obj.style.opacity = this._current;
    };
}
AnimateOpacity.prototype = Object.create(AnimateBase.prototype, {
    "constructor":  AnimateOpacity
});

function Animation(obj) {
    this._obj = obj;                  // object to animate
    this._animeInProgress = false;    // is animation in progress
    this._intervalId = 0;             // current interval ID
    this._animationQueue = [];
    this._completionFunc = null;

    this.htmlObj = function() {
        return this._obj;
    };

    this.animationInProgress = function() {
        return this._animeInProgress;
    };

    this.stopAnimation = function() {
        clearInterval(this._intervalId);
        this._animeInProgress = false;
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
                    that._animationQueue[ii].calcAndDrawFrame();
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

// circular doubly-linked list of popup content
function ResumeExperience() {
    this._experienceTable = {};
    this._yearList = []
    this._index = 0;
    this.addExperience = function(year, obj) {
        this._yearList.push(year);
        this._experienceTable[year] = obj;
    };
    this.getNextExperience = function() {
        if (++this._index == this._yearList.length) {
            this._index = 0;
        }
        var year = this._yearList[this._index];
        return this._experienceTable[year];
    };
    this.getPrevExperience = function() {
        if (--this._index < 0) {
            this._index = (this._yearList.length - 1);
        }
        var year = this._yearList[this._index];
        return this._experienceTable[year];
    };
    this.getExperience = function(year) {
        this._index = this._yearList.indexOf(year);
        return this._experienceTable[year];
    };
}

function Popups(experience) {
    this._experience = experience;    // circular interface to retrieve experience
    this._visible = null;             // popup currently visible on screen
    this._popups = [new Animation(document.getElementById("popup1")), new Animation(document.getElementById("popup2"))];  // all popups
    this._invisible = this._popups.slice(0);   // popups that are not visible (shallow clone of this._popups)

    // is animation of any popup currently happening?
    this._animationIsInProgress = function() {
        return (this._popups[0].animationInProgress() || this._popups[1].animationInProgress());
    };

    // show a popup on the screen
    this.showPopup = function(year) {
        if (this._animationIsInProgress()) {
            return;
        }
        if (this._visible === null) {
            // if no popup is shown slide popup from top
            this._visible = this._invisible.shift();
            if (this._visible.htmlObj().childNodes.length > 0) {
                this._visible.htmlObj().removeChild(this._visible.htmlObj().firstChild);
            }
            this._visible.htmlObj().appendChild(this._experience.getExperience(year));
            this._visible.animateY(0, 100, 10).animateOpacity(0.0, 1.0, 0.02).start();
        } else {
            if (this._visible.htmlObj().childNodes[0].dataset.popupYear === year) {
                // popup with this content/experience is already on screen
                return;
            }
            if (parseInt(year) > this._visible.htmlObj().childNodes[0].dataset.popupYear) {
                // specified year is greater than current, slide down
                this.showNextPopup(year);
            } else {
                // specified year is less than current, slide up
                this.showPrevPopup(year);
            }
        }
    };

    // hide current popup by sliding it to bottom and show new popup by sliding from top
    this.showNextPopup = function(year) {
        if (this._animationIsInProgress() || this._visible === null) {
            return;
        }
        if (this._invisible[0].htmlObj().childNodes.length > 0) {
            this._invisible[0].htmlObj().removeChild(this._invisible[0].htmlObj().firstChild);
        }
        if (year === undefined) {
            // sliding down show next chronological experience
            this._invisible[0].htmlObj().appendChild(this._experience.getNextExperience());
        } else {
            // ... or any experience
            this._invisible[0].htmlObj().appendChild(this._experience.getExperience(year));
        }
        this._visible.animateY(100, 300, 10).animateOpacity(1.0, 0.0, 0.04).start();
        this._invisible[0].animateY(0, 100, 5).animateOpacity(0.0, 1.0, 0.02).start();
        // switch popups
        this._invisible.push(this._visible);
        this._visible = this._invisible.shift();
    };

    // hide current popup by sliding it to top and show new popup by sliding from bottom
    this.showPrevPopup = function(year) {
        if (this._animationIsInProgress() || this._visible === null) {
            return;
        }
        if (this._invisible[0].htmlObj().childNodes.length > 0) {
            this._invisible[0].htmlObj().removeChild(this._invisible[0].htmlObj().firstChild);
        }
        if (year === undefined) {
            // sliding up show previous chronological experience
            this._invisible[0].htmlObj().appendChild(this._experience.getPrevExperience());
        } else {
            // ... or any experience
            this._invisible[0].htmlObj().appendChild(this._experience.getExperience(year));
        }
        this._visible.animateY(100, 0, 10).animateOpacity(1.0, 0.0, 0.04).start();
        this._invisible[0].animateY(300, 100, 10).animateOpacity(0.0, 1.0, 0.02).start();
        // switch popups
        this._invisible.push(this._visible);
        this._visible = this._invisible.shift();
    };

    // move current popup off the screen
    this.hidePopup = function() {
        if (this._animationIsInProgress() || this._visible === null) {
            return;
        }
        // slide down when hidding
        this._visible.animateY(100, 300, 10).animateOpacity(1.0, 0.0, 0.04).start();
        this._invisible.push(this._visible);
        this._visible = null;
    };
}

window.addEventListener("load", function(event) {
    var EVENT_THROTTLE_RATE = 45;
    var DEBOUNCE_DELAY  = 100;

    // create HTML object from string
    var createHtml = function(html) {
        var template = document.createElement("template");
        template.innerHTML = html;
        return template.content.firstChild;
    };

    // initialize circular list of experiences
    var experience = new ResumeExperience();
    experience.addExperience("2006", createHtml("<div data-popup-year=\"2006\">2006</div>"));
    experience.addExperience("2010", createHtml("<div data-popup-year=\"2010\">2010</div>"));
    experience.addExperience("2013", createHtml("<div data-popup-year=\"2013\">2013</div>"));
    experience.addExperience("2015", createHtml("<div data-popup-year=\"2015\">2015</div>"));
    experience.addExperience("2017", createHtml("<div data-popup-year=\"2017\">2017</div>"));
    var popups = new Popups(experience);

    // execute func when event stream stops for "timeout" milliseconds or recieves "rate" amount of events 
    var throttleFunc = function(rate, timeout, func) {
        var toId = 0;         // setTimeout() ID
        var eventCount = 0;   // count of received events
        return function(e) {
            if (eventCount === 0) {
                func();
            }
            // throttling
            eventCount++;
            if (eventCount === rate) {
                eventCount = 0;
            }
            // debouncing
            clearTimeout(toId);
            toId = setTimeout(function() {eventCount = 0;}, timeout);
        }
    };
    var throttledScrollUp = throttleFunc(EVENT_THROTTLE_RATE, DEBOUNCE_DELAY, function() {
        popups.showPrevPopup();
    });
    var throttledScrollDown = throttleFunc(EVENT_THROTTLE_RATE, DEBOUNCE_DELAY, function() {
        popups.showNextPopup();
    });

    // initialize timeline points
    var timelinePoints = document.getElementsByClassName("timeline-point");
    for (var ii = 0; ii < timelinePoints.length; ii++) {
        timelinePoints[ii].onmouseover = function(e) {
            // show experience for correspondin year of timeline point
            popups.showPopup(e.currentTarget.dataset.year);
        };
    }

    window.onclick = function(e) {
        popups.hidePopup();
    };

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

    popups.showPopup("2006");
}, false);

