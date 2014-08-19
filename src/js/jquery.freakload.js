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
        defaults = {
            async: true,
            loadByGroup: false,
            groupOrder: [],
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
        this.opt = $.extend(true, {}, defaults, options);
        this.init();
    }

    Plugin.prototype = {
        /*
         * DATA
         */
        isLoading: false,
        xhr: null, // XMLHttpRequest
        groups: [],

        // use queue as object to possibility multiple queues
        queue: {
            general: []
        },
        loaded: {
            items: [],
            group: []
        },


        /*
         * PUBLIC
         */
        init: function() {
            var group;

            this._addItems(this.items);

            // if has a groupOrder it'll load group by group listed
            // groups that weren't listed will load as regular item
            if (this.loadByGroup) {
                for (group in this.groupOrder) {
                    this.loadGroup(group);
                }
            } else {
                this._request();
            }
        },

        loadGroup: function(group) {
            this._request(group);
        },



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
                    item = { url: item };
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

        _addItems: function(items) {
            var item = {},
                tag,
                i;

            items = this._normalizeItems(items);

            for (i in items) {
                item = items[i];
                this.queue.general[this.queue.general.length] = item;

                // create the new queues based on tags
                if (item.tags.length) {
                    for (tag in item.tags) {
                        tag = item.tags[tag];

                        // if the new tag still doesn't have a queue create one
                        if (!this.queue.hasOwnProperty(tag)) {
                            this.queue[tag] = []

                            // create a new group on groups
                            this.groups[this.groups.length] = {
                                name: tag,
                                itemsRequested: 0,
                                isLoading: false
                            }
                        }

                        // add item to specific queue
                        this.queue[tag][this.queue[tag].length] = item;
                    }
                }
            }
        },

        _request: function(group) {
            var self = this,
                // "general" is the default queue where all items are loadeds
                queue = !group ? 'general' : group;

            group = self.groups[queue];

            // set group as lodaing
            group.isLoading = true;

            // recursion to load all items considering the queues
            setTimeout(function() {
                self._load(group[group[requested]]);
                group[requested]++;
            }, 0);
        },

        _load: function(item) {
            var self = this,
                loadedItems = this.loaded.items,
                isImage = false;

            // check if the item has been loaded
            if (loadedItems.indexOf(item.url) <= -1) {
                // flag as loading and fire the callback
                this.isLoading = true;
                item.isLoading = true;
                this.opt.onItem.start();

                // set xhr
                this.xhr = $.ajax({
                                url: item.url,
                                data: item.data,
                                async: item.async ? item.async : self.opt.async
                            })
                            .success(function(data) {
                                // add to array of loaded items
                                self.loaded.items[loadedItems.length] = this.url + $.isPlainObject(item.data) ? '' : '?' + $.param(item.data);

                                // the data will only be passed to callback if the item won't a image
                                self.opt.onItem.complete((/\.(gif|jpg|png|svg)$/).test(item.url) ? '' : data);

                                // clean the xhr
                                self.xhr = null;

                                // runs the final complete callabck when complete all items
                                if (self.items.length === self.loaded.items.length) {
                                    self.opt.on.complete();
                                }
                            })
                            .fail(function(jqXHR, status) {
                                $.error(jqXHR.responseText);
                            })
                            .always(function() {
                                item.isLoading = false;
                                self.isLoading = false;
                            });
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
            $.error('Method ' + fn + ' does not exist on jQuery.' + _plugin);
        }
    };

})(jQuery, window, document);