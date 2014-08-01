;(function(win, doc) {
    'use strict';

    /* ==============================
        DEFAULTS
    ============================== */

    var audioContext = win.AudioContex || win.webkitAudioContext,
        browserSupport = !!(audioContext);


    /* ==============================
        CONSTRUCTOR
    ============================== */

    function FreakSound() {
        this.init();
    }


    /* ==============================
        PUBLIC
    ============================== */

    FreakSound.prototype = {
        init: function() {
        },

        public: function() {
            // code
        }
    }


    /* ==============================
        PRIVATE
    ============================== */

    var
    _private = function() {
        // code
    },

    _private2 = function() {
        // code
    }


    /* ==============================
        GLOBAL API
    ============================== */

    win.freakSound = function() {
        var args = arguments;

        function freakSound(args) {
            FreakSound.apply(this, args);
        }
        freakSound.prototype = FreakSound.prototype;

        if (browserSupport) {
            return new freakSound(args);
        } else {
            console.error('Web Audio API is not supported in this browser');
        }
    }


})(window, document);