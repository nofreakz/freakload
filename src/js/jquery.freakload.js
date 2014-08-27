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
            if (this.opt.loadByGroup) {
                for (group in this.opt.groupOrder) {
                    this.loadGroup(this.opt.groupOrder[group]);
                }
            } else {
                this._request();
            }
        },

        loadGroup: function(group) {
            this._createGroup(group);
            this._request(group);
        },

        add: function() {},



        /*
         * PRIVATE
         */
        _addItems: function(items) {
            var queue = this.queue,
                item = {},
                tag = '',
                i = 0,
                t = 0;

            items = this._normalizeItems(items);

            for (i in items) {
                item = items[i];
                queue.items[queue.items.length] = item;

                // create the new queues based on tags
                if (item.tags.length) {
                    for (t in item.tags) {
                        tag = item.tags[t];
                        this._createGroup(tag);

                        // add item to specific queue
                        queue.groups[tag].items[queue.groups[tag].items.length] = item;
                    }
                }
            }
        },

        _normalizeItems: function(items) {
            var item = {},
                i = 0;

            // if argument 'items' isn't a Array set as
            if (!(items instanceof Array)) {
                items = [items];
            }

            // normalize with the template setted up previously
            for (i in items) {
                item = items[i];

                if (typeof item !== 'object') {
                    item = { url: item };
                }

                items[i] = item = $.extend({}, itemTpl, item);
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
                this.queue.groups[tag] = $.extend(true, {}, groupTpl);
            }
        },

        // the _request will organize the queues that will be send to _load
        // if it gets a groupName the queue of the group will be prioritized
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
            // here we use a timeInterval instead a regular loop to enjoy the possibility of stop the queue
            loader = setInterval(function() {
                // first, request items by group
                if (group && group.itemsRequested < group.items.length) {
                    item = group.items[group.itemsRequested];

                // request all items from queue where all items are inserted
                } else if (queue.itemsRequested < queue.items.length) {
                    item = queue.items[queue.itemsRequested];

                // stop requests when don't have more items in any queue
                } else {
                    queue.isLoading = false;
                    clearInterval(loader);

                    return;
                }

                // fire the loading and increment itemRequested to know when the queue finished
                if (group) {
                    group.itemsRequested++;
                }

                queue.itemsRequested++;
                self._load(item, group);
            }, 0);
        },

        _load: function(item) {
            var self = this,
                loadedItems = this.loaded.items;

            // check if the item has been loaded
            // avoid multiple ajax calls for loaded items
            if (loadedItems.indexOf(item.url) <= -1) {
                // add to array of loaded items
                loadedItems[loadedItems.length] = item.url + ($.isPlainObject(item.data) ? '' : '?' + $.param(item.data));

                // flag as loading and fire the starting callback
                this.queue.isLoading = true;
                item.isLoading = true;
                this.opt.onItem.start(item);

                // set xhr
                this.xhr = $.ajax({
                                url: item.url,
                                data: item.data,
                                async: item.async ? item.async : self.opt.async
                            })
                            .success(function(data) {
                                // the data will only be passed to callback if the item is a text file
                                self.opt.onItem.complete((/\.(xml|json|script|html|text)$/).test(item.url) ? data : '');

                                // clean the xhr
                                self.xhr = null;

                                // runs the final complete callabck when complete all items
                                if (self.queue.items.length === loadedItems.length) {
                                    self.opt.on.complete();
                                }
                            })
                            .fail(function(jqXHR) {
                                $.error(jqXHR.responseText);
                            })
                            .always(function() {
                                item.isLoading = false;
                            });
            }
        }
    };



    /*
     * GLOBOL API
     */

     // jQuery method
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

    // function for instances of the jQuery
    /*$.fn[_plugin] = function(options) {
        return this.each(function() {
            if (!$(this).is('img')) {
                $.error('The element is not a image.');
                return;
            }
        });
    };*/

})(jQuery, window, document);