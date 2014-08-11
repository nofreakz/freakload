/*
 *  freakLoad - v0.1.0
 *  Preloader JS library
 *  https://github.com/nofreakz/freakLoad
 *
 *  Copyright (c) 2014
 *  MIT License
 */
;(function( win, doc ) {
    'use strict';

    /* ==============================
        DEFAULTS
    ============================== */

    var defaults = {};


    /* ==============================
        CONSTRUCTOR
    ============================== */

    function FreakLoad() {
        this.init();
    }


    /* ==============================
        PUBLIC
    ============================== */

    FreakLoad.prototype = {
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

    win.freakLoad = function() {
        var args = arguments;

        function FreakLoad( args ) {
            FreakLoad.apply( this, args );
        }
        freakLoad.prototype = FreakLoad.prototype;

        return new FreakLoad( args );
    }
})( window, document );