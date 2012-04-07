/**
 * Creates a new artifact object
 * 
 * @param {object} data the object with data in it.
 * @param {string} data.id id of artifact
 * @param {boolean} data.newData flag indicating if the data is new or not
 * @param {int} data.timestamp date the entry was made (yyyymmddhhmmss)
 * @param {int} data.wingspan wingspan
 * @param {float} data.lhandX x position of the left hand
 * @param {float} data.lhandY y position of the left hand
 * @param {float} data.rhandX x position of the right hand
 * @param {float} data.rhandY y position of the right hand
 * @param {int} data.torso torso length
 * @param {int} data.height height of the person
 * @param {int} data.leg length of the person's leg
 * @param {int} data.arm length of the person's arm
 * @param {int} data.bbox the area the person occupies
 * @param {float} data.frameSize the percentage of points hitting the person
 * @param {int} data.avgVoice the average of the peaks and valleys of the person's voice
 */
var Artifact = function(data) {
    this.id = data.id;
    this.owner = data.owner;
    this.newData = data.newData;
    this.timestamp = parseInt(data.timestamp);
    this.wingspan = parseInt(data.wingspan);
    this.lhandX = parseFloat(data.lhandX);
    this.lhandY = parseFloat(data.lhandY);
    this.rhandX = parseFloat(data.rhandX);
    this.rhandY = parseFloat(data.rhandY);
    this.torso = parseInt(data.torso);
    this.head = parseInt(data.head);
    this.height = parseInt(data.height);
    this.arm = parseInt(data.arm);
    this.leg = parseInt(data.leg);
    this.playerSize = parseInt(data.frameSize);
    this.totalDepthPoints = 76800;
    this.frameSize = this.playerSize / this.totalDepthPoints;
    this.bbox = parseFloat(data.bbox);
    this.avgVoice = parseInt(data.avgVoice);
    
    // Data not relevent to kinect
    this.views = parseInt(data.views);
    this.stars = parseInt(data.stars);
};

Artifact.prototype.getLegToHead = function() {
    return this.arm / this.leg;
};



var socket = io.connect(location.protocol + '//' + location.host)
  , artifactData
  , ARTI = {
    
    getArtifactId : function() {
        return document.querySelector('#artifact-id').value;
    },
    
    processArtifactData : function() {
        /*
        socket.emit('get_artifact', {'artifactId' : ARTI.getArtifactId()});
        socket.on('send_artifact', function (data) {
            console.log(data);
            artifactData = new Artifact(data);
            console.log(artifactData);
            ARTI.readyForProcessing();
        });
        */
        
        artifactData = new Artifact(artifactData);
        console.log(artifactData);
        ARTI.readyForProcessing();
    },
    
    /**
     * Increments a count if it has not already been called
     * 
     * @param {string} key the local storage object's name and the event to be emitted by socket.io
     * @return {boolean} true if the count was actually incremented, false if the count remains unchanged.
     */
    increment : function(key) {
        var keys = localStorage.getItem(key),
            artifactId = this.getArtifactId();
            
        keys = JSON.parse(keys);
        if (!keys) {
            keys = [artifactId];
        } else {
            if (keys.indexOf(artifactId) > -1) {
                // This artifact is already in localStorage - we don't need to do anything
                return false;
            } else {
                keys.push(artifactId);
            }
        }
        localStorage.setItem(key, JSON.stringify(keys));
        socket.emit(key, {artifactId : artifactId});
        return true;
    },
    
    view : function() {
        this.increment('views');
    },
    
    star : function() {
        if (this.increment('stars')) {
            var $stars = $('.icon-star + span'),
                starCount = parseInt($stars.html());
            
            $('#give-star').addClass('starred');
            $stars.fadeOut(function(){
                $stars.html(starCount + 1).fadeIn();
            });
        }
    },
    
    /**
     * Updates the #give-star button with a class based on whether or not they've clicked it or not
     */
    updateStarButton : function() {
        var stars = localStorage.getItem('stars')
          , artifactId = this.getArtifactId()
          , title;
          
        stars = JSON.parse(stars);
        if (!stars) stars = [];
        if (stars.indexOf(artifactId) > -1) {
            // artifact exists in local storage
            $('#give-star').addClass('starred');
            title = ARTI.getRandomTooltip();
        } else {
            $('#give-star').addClass('not-starred');
            title = ARTI.getRandomTooltip();
        }
        
        $('#give-star').tooltip({
            title: title
        });
    },
    
    /**
     * Gets a random tooltip from the tooltips array and then removes it from the array
     * so that we don't get the same random element again
     * 
     * @return {string} the tooltip!
     */
    getRandomTooltip : function() {
        return ARTI.tooltips[Math.floor(Math.random() * ARTI.tooltips.length)];
    },
    
    getCanvasDataURI : function() {
        return document.querySelector("#artifact").toDataURL("image/png");
    },
    
    getProcessingInstance : function(id, fn) {
        var instance;
        id = id || 'artifact';
        instance = Processing.getInstanceById('artifact')
        if (instance) {
            fn(instance);
        } else {
            setTimeout(function(){
                ARTI.getProcessingInstance(id, fn);
            }, 200);
        }
    },
    
    readyForProcessing : function() {
        this.getProcessingInstance('artifact', function(instance) {
            instance.ready();
        });
    },
    
    artifactsPerPage : 8,
    currentFilter : 'recent',
    currentStart : 0,
    currentStop : null,
    
    galleryPage : function() {
        this.currentStop = this.artifactsPerPage - 1;
        // Next
        $('.gallery .button-fwd').on('click', function() {
            ARTI.getMoreArtifacts('next');
        });
        
        // Prev
        $('.gallery .button-back').on('click', function() {
            ARTI.getMoreArtifacts('prev');
        });
        
        // Filters
        $('.filter').on('click', 'li a', function(event) {
            var $this = $(this);
            event.preventDefault();
            $('.filter .active').removeClass('active');
            $this.parent().addClass('active');
            ARTI.currentFilter = $this.attr('data-filter');
            ARTI.getMoreArtifacts();
        });
        
        // Received new data
        socket.on('got_more_artifacts', function(data) {
            console.log(data);
            // Scroll back to the top
            if (!ARTI.isInView(document.querySelector('.filter'))) {
                document.getElementById('main').scrollIntoView(true);
            }
            ARTI.updateArtifactNav(data.total);
            ARTI.artifactsReceived(data.html);
        });
    },
    
    getMoreArtifacts : function(direction) {
        if (this.currentStart == 0 && direction == 'prev') {
            return;
        }
        if (direction == 'next') {
            this.currentStart += this.artifactsPerPage;
            this.currentStop += this.artifactsPerPage;
        } else if (direction == 'prev') {
            this.currentStart -= this.artifactsPerPage;
            this.currentStop -= this.artifactsPerPage;
        } else {
            // direction is null, we're changing filters
            this.currentStart = 0;
            this.currentStop = this.artifactsPerPage - 1;
        }
        console.log('emitting get_more_artifacts. start: ' + this.currentStart + ', stop: ' + this.currentStop + ', filter: ' + this.currentFilter);
        socket.emit('get_more_artifacts', {start: this.currentStart, stop: this.currentStop, filter : this.currentFilter});
    },
    
    artifactsReceived : function(html) {
        var $grid = $('.grid');
        if (!html) {
            // Didn't get anything back!
            $grid.html('<p>Sorry, we\'re bad archaeologists, we couldn\'t find any artifacts for you :(</p>');
        } else {
            $grid.addClass('closed');
            setTimeout(function(){
                $grid.html(html).removeClass('closed');
            }, 450);
        }
    },
    
    /**
     * @param {int} total the total number of artifacts available for the current filter
     */
    updateArtifactNav : function(total) {
        var $nav = $('.gallery nav');
        $nav.attr('data-total', total).removeClass();
        if (ARTI.currentStart == 0) {
            $nav.addClass('no-prev');
        }
        if (ARTI.currentStop >= total || ARTI.currentFilter == 'featured') {
            $nav.addClass('no-next');
        }
    },
    
    checkinPage : function() {
        $('.size .dropdown .button').dropdown();
        this.initCheckUsername();
        this.initCheckinSubmit();
    },
    
    initCheckUsername : function() {
        $('#f-name').on('blur', function(evt) {
            if (this.value == '') {
                return;
            }
            $('.owner-name .error, .owner-name .available').addClass('hidden');
            var username = this.value;
            username = username.replace(/[^a-zA-Z0-9]+/g,'-').replace(/-$/, '');
            if (username.length > 16) {
                username = username.substr(0, 15);
            }
            this.value = username;
            socket.emit('user_exists', {username: username} );
        });
        
        socket.on('user_exists', function(response) {
            if (response.exists) {
                $('.owner-name .error').removeClass('hidden');
            } else {
                $('.owner-name .available').removeClass('hidden');
            }
        });
        
        $('.modal .modal-footer .button').on('click', function(evt) {
            evt.preventDefault();
            $('.modal').modal('hide');
            window.location = '/artifact/' + ARTI.getArtifactId(); 
        });
    },
    
    initCheckinSubmit : function() {
        $('.checkin form').on('submit', function(evt){
            evt.preventDefault();
            var ok = true
              , nameInput = document.querySelector('#f-name')
              , emailInput = document.querySelector('#f-email')
              , size = document.querySelector('.size .dropdown').getAttribute('data-value')
              , invalidEmail = emailInput.validity.typeMismatch || !ARTI.email_is_valid(emailInput.value)
              , sendEmail = false;
              
              $('.owner.email .input-description.error').addClass('hidden');
              
              if (nameInput.value == '') {
                  ok = false;
                  nameInput.focus();
              }
              
              // They have input something in the email field, but it's invalid
              if (emailInput.value != '' && invalidEmail) {
                  ok = false;
                  $('.owner-email .input-description.error').removeClass('hidden');
                  emailInput.focus();
              } 
              
              // They have a correct email address, but no size selected
              else if (emailInput != '' && !invalidEmail && size == '') {
                  ok = false;
                  document.querySelector('.size .dropdown').focus();
              }
              
              else if (emailInput != '' && !invalidEmail) {
                  sendEmail = true;
              }
              
              if (ok) {
                // emit socket event
                var uri = ARTI.getCanvasDataURI()
                  , artifactId = ARTI.getArtifactId()
                  , request = {
                        uri : uri,
                        artifactId : artifactId, 
                        username : nameInput.value,
                        sendEmail : sendEmail,
                        email : emailInput.value,
                        attachment : size
                    };
                console.log('sending off save request');
                console.log(request);
                socket.emit('save_artifact', request);
            }
        });

        // Save button
        $('#save-artifact').on('click', function(){
            var uri = ARTI.getCanvasDataURI(),
                artifactId = ARTI.getArtifactId();
            socket.emit('save_artifact', {uri : uri, artifactId : artifactId});
        });
        
        // Save anonymously button
        $('#save-anonymous').on('click', function(evt) {
            // emit socket event
            var uri = ARTI.getCanvasDataURI(),
                artifactId = ARTI.getArtifactId(),
                request = {
                    uri : uri,
                    artifactId : artifactId, 
                    username : 'anonymous',
                    sendEmail : false
                };
            console.log('sending off save request');
            console.log(request);
            socket.emit('save_artifact', request);
        });
        
        // On saved response
        socket.on('artifact_saved', function(response){
            console.log(response);
            $('.modal-body p').html('Your username is: <span class="highlight">' + response.username + '</span>');
            $('.modal').modal();
            document.querySelector('.checkin form').reset();
            $('.checkin .dropdown').attr('data-value', '').children().first().text('Select a Device');
            $('form .available, form .error').addClass('hidden');
        });
    },
    
    /**
     * Code to run when the artifact page is ready
     * Increments views, adds on click for star button, and updates the star button
     */
    artifactPage : function() {
        ARTI.view();
        ARTI.updateStarButton();
        $('#give-star').on('click', function() {
            ARTI.star();
        });
        
        $('.js-replay').on('click', function() {
            ARTI.getProcessingInstance('artifact', function(instance) {
                instance.replay();
            });
        });
    },
    
    tooltips : [
        'May the star be with you.',
        'I love the smell of artifacts in the morning.',
        'I think this is the beginning of a beautiful friendship.',
        'You&rsquo;re making me an offer I can&rsquo;t refuse.',
        'Show me the favorites!!',
        'Go ahead, push my button.',
        'Out of all the buttons on the page, you click on mine.',
        'You clickin&rsquo; on me?',
        'My preciousness.',
        'This is cooler than the other side of the pillow!'
    ],
    
    email_is_valid : function(email) {
        var emailRegEx = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
        if (!emailRegEx.test(email)) {
            return false;
        }
        return true;
    },
    
    isInView : function (elem, completelyVisible) {
        var docViewTop = $(window).scrollTop(),
            docViewBottom = docViewTop + $(window).height(),
            elemTop = $(elem).offset().top,
            elemBottom = elemTop + $(elem).height(),
            isInView;
        
        if (completelyVisible) {
            isInView = ((elemBottom >= docViewTop) && (elemTop <= docViewBottom)
                && (elemBottom <= docViewBottom) && (elemTop >= docViewTop) );
        } else {
            isInView = ((elemBottom <= docViewBottom) && (elemTop >= docViewTop));
        }
        
        return isInView;
    }
};


(function() {
    
    // Give IE 8 the indexOf function
    if(!Array.prototype.indexOf) {
        Array.prototype.indexOf = function(needle) {
            for(var i = 0; i < this.length; i++) {
                if(this[i] === needle) {
                    return i;
                }
            }
            return -1;
        };
    }
})();