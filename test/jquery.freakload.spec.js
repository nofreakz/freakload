// test items
var instance = null,
    item = '',
    items = [],
    tag = 'groupName',
    i = 0;

while (i < 5) {
    items[i] = 'teste' + (++i) + '.jpg';

    if (i == 0) {
        item = items[i];
    }
}

// instacing the Plugin
$.freakLoad(items);
instance = $(document).data('freakLoad');

describe("FreakLoad", function() {
    it("_createGroup()", function() {
        instance._createGroup(tag);
        expect(instance.queue.groups[tag]).toEqual({
            itemsRequested: jasmine.any(Number),
            isLoading: jasmine.any(Boolean),
            items: jasmine.any(Array)
        });
    });

    it("_normalizeItems()", function() {
        expect(instance._normalizeItems(item)).toContain({
            url: jasmine.any(String),
            data: jasmine.any(Object),
            priority: jasmine.any(Number),
            tags: jasmine.any(Array),
            isLoading: jasmine.any(Boolean),
            async: jasmine.any(Boolean)
        });
    });
});