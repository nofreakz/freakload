;(function($, win, doc) {

    'use strict';



    /*
     * DEFAULTS
     */
    var _plugin = 'freakLoad',
        itemTpl = {
            url: '',
            data: {},
            priority: 0.5,
            tags: [],
            isLoading: false,
            async: true
        },
        groupTpl = {
            name: '',
            isLoading: false
        },
        defaults = {
            async: true,
            loadByGroup: false,
            on: {
                start: $.noop,
                complete: $.noop
            },
            onItem: {
                start: $.noop,
                complete: $.noop
            },
            onGroup: {
                start: $.noop,
                complete: $.noop
            }
        };



    /*
     * CONSTRUCTOR
     */
    function Plugin(items, options) {
        this.items = items;
        this.opt = $.extend({}, defaults, options);
        this.init();
    }



    Plugin.prototype = {
        /*
         * DATA
         */
        isLoading: false,
        xhr: null, // XMLHttpRequest
        queue: [],
        loaded: {
            items: [],
            group: []
        },
        groups: [],


        /*
         * PUBLIC
         */
        init: function() {
            this.items = this._normalizeItems(this.items);
            this._load(this.items);
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

        _removeItem: function () {},

        _load: function(items) {
            var self = this,
                loaded = self.loaded.items,
                item = '',
                isImage = false,
                len = items.length,
                i = 0;

            // preloader
            for (; len--; i++) {
                item = items[i];

                // check if the item has been loaded
                if (this.loaded.items.indexOf(item.url) <= -1) {
                    // flag as loading and fire the callback
                    this.isLoading = true;
                    this.opt.onItem.start();

                    /*
                     * HOLD FUNCTIONS TO SYNC CALLINGS HERE
                     */
                    // set xhr
                    this.xhr = $.ajax({
                        url: item.url,
                        data: item.data,
                        async: item.async ? item.async : self.opt.async,
                        success: function(data) {
                            console.log('-----');
                            // add to array of loaded items
                            loaded[loaded.length] = item.url + '?' + item.data;
                            // the data will only be passed to callback if the item won't a image
                            self.opt.onItem.complete((/\.(gif|jpg|png|svg)$/).test(item.url) ? '' : data);
                        },
                        error: function(jqXHR, status) {
                            $.error(jqXHR.responseText);
                        }
                    })
                    /*
                    * callbacks
                    * add itens to item loaded
                    * preload false, ready to the next one
                    */
                }
            }
        }
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