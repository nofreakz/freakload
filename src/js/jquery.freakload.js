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
            async: true
        },
        groupTpl = {
            items: [],
            loaded: 0
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
            loaded: 0,
            items: [],
            groups: {
                // @groupTpl
            },
        },

        requested: {
            items: [],
            groups: []
        },


        /*
         * PUBLIC
         */
        init: function() {
            this._addItems(this.items);
            this.load();
        },

        load: function() {
            var group;

            // if has a groupOrder it'll load group by group listed
            // groups that weren't listed will load as regular item
            if (this.opt.loadByGroup) {
                for (group in this.opt.groupOrder) {
                    this.loadGroup(this.opt.groupOrder[group]);
                }
            }

            this._request();
        },

        loadGroup: function(groupName) {
            if (this._isGroup(groupName)) {
                this._request(groupName);
            } else {
                console.warn('No items was found to be loaded on the group "' + groupName + '".');
            }
        },

        // new items and a flag to indicate if have to load the new items
        add: function(items, load) {
            this._addItems(items);

            // load by default
            if (load === false ? load : true) {
                this.load();
            }
        },



        /*
         * PRIVATE
         */
         // add items to general and specific queue
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
            if (!this._isGroup(tag)) {
                // create a new group on groups
                this.queue.groups[tag] = $.extend(true, {}, groupTpl);
            }
        },

        _isGroup: function(groupName) {
            return this.queue.groups.hasOwnProperty(groupName) ? true : false;
        },

        // the _request will organize the queues that will be send to _load
        _request: function(groupName) {
            // group only will be setted if the function recive a groupName
            // otherwise group is going to the default queue of items
            var group = this.queue,
                i = 0,
                len = 0;

            // set group as lodaing and load the specific queue
            if (groupName) {
                group = this.queue.groups[groupName];
            }

            // load items
            // stop loops when the number of loaded items is equal the size of the general queue
            for (len = group.items.length; i < len && this.requested.items.length < this.queue.items.length; i++) {
                this._load(group.items[i], group, groupName);
            }
        },

        _load: function(item, group, groupName) {
            // check if the item has been loaded
            // avoid multiple ajax calls for loaded items
            if (this.requested.items.indexOf(item.url) === -1) {
                var self = this;


                // add to array of loaded items
                this.requested.items[this.requested.items.length] = item.url + ($.isPlainObject(item.data) ? '' : '?' + $.param(item.data));

                // flag as loading and fire the starting callback
                item.isLoading = group.isLoading = true;
                this.opt.onItem.start(item);

                if (this.requested.groups.indexOf(groupName) === -1) {
                    this.requested.groups[this.requested.groups.length] = groupName;
                    this.opt.onGroup.start(groupName);
                }

                // set xhr
                this.xhr = $.ajax({
                                url: item.url,
                                data: item.data,
                                async: item.async ? item.async : self.opt.async
                            })
                            .success(function(data) {
                                group.loaded++;
                                self.queue.loaded++;

                                // the data will only be passed to callback if the item is a text file
                                self.opt.onItem.complete((/\.(xml|json|script|html|text)$/).test(item.url) ? data : '');

                                // runs group callabck when complete all items
                                if (groupName && (group.loaded === group.items.length || self.queue.loaded === self.queue.items.length)) {
                                    self.opt.onGroup.complete(groupName);
                                }

                                // runs the final complete callabck when complete all items
                                if (self.queue.loaded === self.queue.items.length) {
                                    self.opt.on.complete();
                                }

                                // clean the xhr
                                self.xhr = null;
                            })
                            .fail(function(jqXHR) {
                                $.error(jqXHR.responseText);
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

        // if it still doesn't have been instanced, do that
        } else if (!data) {
            $.data(doc, _plugin, new Plugin(items, options));

        // check if data is a instance of the Plugin and fire the specific method
        // or simply add the new items to the loading
        } else if (data instanceof Plugin) {
            if (typeof method === 'function') {
                method.apply(data, Array.prototype.slice.call(args, 1));
            } else if (items) {
                $[_plugin]('add', items);
            }

        // finally if the method doesn't exist or is a private method show a console error
        } else if (!method || (typeof fn === 'string' && fn.charAt(0) === '_')) {
            $.error('Method ' + fn + ' does not exist on jQuery.' + _plugin);
        }
    };

})(jQuery, window, document);