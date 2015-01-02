// Filename: router.js
define([
    'jquery',
    'underscore',
    'backbone',
    'backbone.localStorage',
    'app'
], function($, _, Backbone, app) {

    app.AppView = Backbone.View.extend({
        el: '#readerapp',
        initialize: function() {
            this.input = this.$('#new-feed');
            app.feedList.on('add', this.addOne, this);
            app.feedList.on('reset', this.addAll, this);
            app.feedList.fetch(); // Load from local storage

            app.articlesView.displayArticles();
        },
        events: {
            'keypress #new-feed': 'createFeedOnEnter',
            "click #load-opml": "loadOpml",
            "click .remove-feed": "removeFeed",
        },
        createFeedOnEnter: function(e) {
            var enter_key = 13;
            if (e.which !== enter_key) {
                return;
            }
            app.feedList.create({
                uri: this.input.val().trim(),
                title: ''
            });
            this.input.val(''); // Clear the input box
        },
        loadOpml: function(file) {
            var reader = new FileReader();
            var file = $(':file')[0].files[0];

            reader.onload = (function(theFile) {
                return function(e) {
                    // Render thumbnail.
                    var fileText = e.target.result;
                    var xmlDoc = $.parseXML(fileText);
                    var $xml = $(xmlDoc);
                    var $feeds = $xml.find("outline[type='rss']")
                    $feeds.each(function(index, feed) {
                        app.feedList.create({
                            uri: feed.attributes['xmlUrl'].value
                        });
                    });
                };
            })(file);

            reader.readAsText(file);

        },
        removeFeed: function(e) {
            var id = $(e.currentTarget).data("id");
            var feed = app.feedList.get(id);
            feed.destroy();
            e.target.parentElement.parentElement.removeChild(e.target.parentElement);
        },
        addOne: function(feed) {
            var view = new app.FeedView({
                model: feed
            });

            if (feed.attributes.title === '') {
                feed.fetchTitle(function(feed) {
                    $('#feed-list').append(view.render().el);
                });
            } else {
                $('#feed-list').append(view.render().el);
            }
        },
        addAll: function() {
            this.$('#feed-list').html('');
            app.feedList.each(this.addOne, this);
        }
    });

    app.appView = new app.AppView();
});
