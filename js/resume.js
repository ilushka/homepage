function AnimeObj(obj) {
    this.obj = obj;     // object to animate
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

window.addEventListener("load", function(event) {
    var popupAnime = new AnimeObj(document.getElementById("popup"));
    popupAnime.setRate(18);
    var animatePopup = function() {
        popupAnime.animateY(window.innerHeight, 30);
    };

    window.onmousewheel = window.onwheel = window.ontouchmove = document.onkeydown = function(e) {
        e.preventDefault();
        console.log(e);
        animatePopup();
    };
}, false);
