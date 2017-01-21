function AnimeObj(obj) {
    this.obj = obj;                 // object to animate
    this.animeInProgress = false;   // is animation in progress
    this.rate = 1;                  // unit count that is used to modify property per each frame 

    this.setRate = function(rate) {
        this.rate = rate;
    };

    /* animate object on Y axis */
    this.animateY = function(from, to) {
        var that = this;
        var position = from;
        var intId = 0;

        if (that.animeInProgress === true)
            return;
        that.animeInProgress = true;
        obj.style.top = position + "px";
        intId = setInterval(animateYFrame, 5);

        /* per frame function */
        function animateYFrame() {
            if (position <= to) {
                clearInterval(intId);
                that.animeInProgress = false;
            } else {
                position -= that.rate;
                that.obj.style.top = position + "px";
            } 
        }
    };
}
/* execute function every N events */
var throttleFunc = function(rate, func) {
    var eventCount = 0;
    return function(e) {
        if (eventCount === 0) {
            func();
            eventCount = rate;
        }
        eventCount--;
    }
};
/* execute function every N milliseconds */
var debounceFunc = function(interval, func) {
    var okToExec = true;
    return function(e) {
        if (okToExec === true) {
            okToExec = false;
            func();
            setTimeout(function() {okToExec = true;}, interval);
        }
    }
};

window.addEventListener("load", function(event) {
    var popupAnime = new AnimeObj(document.getElementById("popup"));
    popupAnime.setRate(18);
    var scrollPopup = function() {
        popupAnime.animateY(window.innerHeight, 30);
    };
    var scrollPopupDebounced = debounceFunc(500, scrollPopup);

    window.onmousewheel = window.onwheel = window.ontouchmove = document.onkeydown = function(e) {
        e.preventDefault();
        console.log(e);
        scrollPopupDebounced(e);
    };
}, false);

