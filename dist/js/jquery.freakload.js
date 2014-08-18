/*
 *  freakLoad - v0.1.0
 *  Preloader JS library
 *  https://github.com/nofreakz/freakLoad
 *
 *  Copyright (c) 2014
 *  MIT License
 */
;(function($, win, doc) {

    'use strict';

    var _plugin = 'freakLoad',
        itemTpl = {
            url: '',
            priority: 0.5,
            tags: [],
            isLoading: false,
            normalized: true
        },
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
        init: function() {
            this.items = this._normalizeItems(this.items);
            this._load();
        },
        add: function () {},
        remove: function() {},
        stop: function() {},
        continue: function() {},
        loadGroup: function() {},

        /*
         * PRIVATE
         */
        _normalizeItems: function(items) {
            var item = {},
                len = 0,
                i = 0;

            // if argument 'items' isn't a Array set as
            if (!(items instanceof Array)) {
                items = [items];
            }

            // read the size of the array items
            len = items.length;

            // normalize with the template setted up previously
            for (; len--; i++) {
                item = items[i];

                if (typeof item !== 'object') {
                    item = { url: item }
                }

                items[i] = $.extend({}, itemTpl, item);
            }

            this._setPriority(items);

            return items;
        },
        _setPriority: function(items) {
            // organize items by priority
            items.sort(function(a, b) {
                return b.priority - a.priority;
            });

            return items;
        },
        _addItem: function () {},
        _removeItem: function () {}
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
            $.error('The jquery plugin ' + _plugin + ' is not able to run whitout arguments or array of items to load.');
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