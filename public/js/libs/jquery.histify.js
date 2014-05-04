/**
 * Inspired by History.js and jQuery.pjax.js
 * 
 */
(function($) {
    var $body = $('body'),
        $main = $('#main'),
        baseUrl = document.location.protocol + '//' + (document.location.hostname || document.location.host),
        
        
        // Used to detect initial (useless) popstate.
        popped = ('state' in window.history),
        initialURL = location.href;

    

    var loadPage = function(url) {
        $body.trigger('request.histify').addClass('loading');
        $.ajax({
            url : url,
            dataType : 'json',
            success : function(response) {
                pageLoaded(response.html, response.data, url);
            }
        });
    }

    var pageLoaded = function(html, data, url) {
        var $content = $(html),
            title = data.title || ARTI.defaultTitle,
            relativeUrl = url.replace(baseUrl, ''),
            state,
            hasHash = relativeUrl.match(/#/),
            scrollingTo,
            urlNoHash;

        $body.trigger('loaded.histify', data);
            
        // If the url hash a hash in it, scroll to that instead of the top
        scrollingTo = hasHash ? relativeUrl.substr(hasHash.index) : $main;
        
        urlNoHash = hasHash ? relativeUrl.substring(0, hasHash.index) : relativeUrl;
        
        state = {
            histify : true,
            title : title,
            path : urlNoHash
        }

        // Add an entry to the browser history
        if (window.history.state) {
            history.pushState(state, title, url);
        } else {
            history.pushState(null, title, url);
        }
        
        // Save our state to the plugin
        $.histify.state = state;

        // Ajaxify new content
        $content.histify();
        
        // Replace current content
        $main.html($content);

        $body.trigger('replaced.histify', data);

        // Inform Google Analytics of the change
        if ( typeof pageTracker !== 'undefined' ) {
            pageTracker._trackPageview(relativeUrl);
        }
        
        
        setTimeout(function() {
            $body.removeClass('loading');
            $(window).scrollTop(0);
        }, 500);
    }
    
    $.fn.histify = function() {
        this.find('a').not('[target="_blank"], [href="#"], [data-external], .details-share a').on('click', function(event) {
            var url = $(this).attr('href'),
                pattern = new RegExp("^" + baseUrl);
            // Middle click, cmd click, and ctrl click should open links in a new tab as normal.
            // Check for external links too
            if (event.which > 1 || event.metaKey || !Modernizr.history || (url.match(/^http:/) && !url.match(pattern))) {
                return true;
            }
            
            event.preventDefault();
            loadPage(url);
        });
        
        
        return this;
    };
    
    $.histify = $.fn.histify;
    
    $(window).on('popstate', function(event) {
        // Ignore inital popstate that some browsers fire on page load
        var initialPop = !popped && location.href == initialURL;
        popped = true;
        if (initialPop) return;
        
        // If the history entry being activated was created by a call to history.pushState() or was affected by a call to history.replaceState()
        var curRelUrl = location.pathname.replace(baseUrl, '');
        
        // If the urls have the same file in them, ignore it (most likely a jump link)
        if ($.histify.state && curRelUrl.match($.histify.state.path)) {
            return;
        }
        
        if ((event.state && event.state.histify) || ($.histify.state && $.histify.state.path !== curRelUrl)) {
            loadPage(location.href);
        }
    });
})(jQuery);