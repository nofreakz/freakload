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
            itemsRequested: 0,
            isLoading: false,
            items: []
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
        xhr: null, // XMLHttpRequest


        // use queue as object to possibility multiple queues
        queue: {
            itemsRequested: 0,
            isLoading: false,
            items: [],
            groups: {
                /* @groupTpl */
            }
        },

        loaded: {
            items: [],
            groups: []
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

        loadGroup: function(tag) {
            this._createGroup(tag);
            this._request(tag);
        },

        add: function() {},



        /*
         * PRIVATE
         */
        _addItems: function(items) {
            var item = {},
                queue = this.queue,
                tag,
                i;

            items = this._normalizeItems(items);

            for (i in items) {
                item = items[i];
                queue.items[queue.items.length] = item;

                // create the new queues based on tags
                if (item.tags.length) {
                    for (tag in item.tags) {
                        tag = item.tags[tag];
                        this._createGroup(tag);

                        // add item to specific queue
                        queue.groups[tag].items[queue.groups[tag].items.length] = item;
                    }
                }
            }
        },

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

        _createGroup: function(tag) {
            // if the new tag still doesn't have a queue create one
            if (!this.queue.groups.hasOwnProperty(tag)) {
                // create a new group on groups
                this.queue.groups[tag] = groupTpl;
            }
        },

        _request: function(groupName) {
            var self = this,
                loader = null,
                queue = this.queue,

                // group only will be setted if the function recive a groupName
                group,

                // item is going to be setted on loader
                // it'will be the item to be sent to _load
                item;

            // set group as lodaing and point the specific queue to load
            if (groupName) {
                group = queue.groups[groupName];
                group.isLoading = true;
            }

            // recursion to load all items considering the queues
            // use timeInterval instead timeOut
            // check: http://jsperf.com/setinterval-vs-recursive-settimeout
            loader = setInterval(function() {
                // first, request items by group
                if (group && group.itemsRequested < group.items.length) {
                    item = group.items[group.itemsRequested];

                // request all items
                // "general" is the default queue where all items are inserted
                } else if (queue.itemsRequested < queue.items.length) {
                    item = queue.items[queue.itemsRequested];

                // stop requests when don't have more items in any queue
                } else {
                    return clearInterval(loader);
                }

                // just fire the loading if have items to do that
                if (item) {
                    (group ? group : queue).itemsRequested++;
                    self._load(item);

                    // reset item to the next loading
                    item = null;

                }
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
                this.opt.onItem.start(item);

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

    $.fn[_plugin] = function() {}

})(jQuery, window, document);