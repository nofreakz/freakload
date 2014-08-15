;(function($, win, doc) {

    'use strict';

    var _plugin = 'freakLoad',
        defaults = {
            async: true,
            maxQueueSize: 4,
            onStart: $.noop,
            onComplete: $.noop,
            onItemStart: $.noop,
            onItemComplete: $.noop,
            onGroupStart: $.noop,
            onGroupComplete: $.noop
        };

    function Plugin(items, options) {
        this.items = items;
        this.opt = $.extend({}, defaults, options);
        this.init();
    }

    Plugin.prototype = {
        /*
         * DATA
         */
        xhr: null,

        /*
         * items = [{
         *     url: '/path/to/file',
         *     priority: 0.0 ~ 1.0,
         *     tags: 'item;item',
         *     isLoading: boolean
         * }]
         */
        queue: [],
        isLoading: false,

        /*
         * PUBLIC
         */
        init: function() {},
        add: function () {},
        remove: function() {},
        loadGroup: function() {},

        /*
         * PRIVATE
         */
        _addQueue: function () {}
    }


    /*
     * GLOBOL API
     */
    $[_plugin] = function(fn, options) {
        var args = arguments,
            data = $.data(doc, _plugin),
            items = fn instanceof Array ? fn : false,
            method = data && !items ? data[fn] : false;

        // force to pass a method or items to plugin load
        if (!args.length || (!data && !items)) {
            console.error('The jquery plugin ' + _plugin + ' is not able to run whitout arguments or array of items to load.');
            return;

        // if it still doesn't have gone instanced, do that
        } else if (!data) {
            $.data(doc, _plugin, new Plugin(items, options));

        // check if data is a instance of the Plugin and fire the specific method
        // or simply add the new items to the loading
        } else if (data instanceof Plugin && items) {
            if (typeof method === 'function') {
                method.apply(data, Array.prototype.slice.call(args, 1));
            } else {
                $[_plugin]('add', items);
            }

        // finally if the method doesn't exist or is a private method show a console error
        } else if (!method || (typeof fn === 'string' && fn.charAt(0) === '_')) {
            $.error('Method ' + fn + ' does not exist on jQuery.' + _plugin + ' ' + this);
        }
    };
})(jQuery, window, document);