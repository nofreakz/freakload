;(function(win, doc) {
    'use strict';

    /* ==============================
        DEFAULTS
    ============================== */

    var browserSupport = true;


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
            // code
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

        return new freakSound(args);
    }


})(window, document);
