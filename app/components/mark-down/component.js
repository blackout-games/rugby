import Ember from 'ember';
import config from '../../config/environment';

const { Blackout, $ } = Ember;

/**
 * Showdown
 * DEMO / Playground
 * http://showdownjs.github.io/demo/
 */

export default Ember.Component.extend({
  store: Ember.inject.service(),
  locale: Ember.inject.service(),
  text: Ember.inject.service(),
  
  // Naked URL regex (Blackout Entertainment)
  // This regex will also match square brackets in the query section only
  // if both an opening and closing bracket appear so that we won't match
  // a closing bracket in old-style tags like [url=http://url?query]text[/url]
  // For full explanation add this regex to https://regex101.com/
  // Feb 16 2016: Added support for IP address and port as host
  nakedUrlRegex: /((?:(http(?:s)?):\/\/)?((?:[-a-zA-Z0-9@:%_\+~#=]{1,256}\.)?[-a-zA-Z0-9@:%_\+~#=]{2,256}\.[a-z]{2,6}\b|(?:[0-9]{1,3}\.){3}[0-9]{1,3}(?::[0-9]{1,5})?)(\/(?:\[[-a-zA-Z0-9@:%_\+.,~#?&\/\/=]*\]|[-a-zA-Z0-9@:%_\+.,~#?&\/\/=]*)*)?)/gi,
  nakedUrlRegexOuter: /([\s\S])((?:(http(?:s)?):\/\/)?((?:[-a-zA-Z0-9@:%_\+~#=]{1,256}\.)?[-a-zA-Z0-9@:%_\+~#=]{2,256}\.[a-z]{2,6}\b|(?:[0-9]{1,3}\.){3}[0-9]{1,3}(?::[0-9]{1,5})?)(\/(?:\[[-a-zA-Z0-9@:%_\+.,~#?&\/\/=]*\]|[-a-zA-Z0-9@:%_\+.,~#?&\/\/=]*)*)?)([\s\S])/gi,

  extendMarkdown: Ember.on('didReceiveAttrs', function() {

    var markdown = Ember.Blackout.String(this.get('markdown'));
    
    if(typeof(markdown)!=='string'){
      return;
    }
    
    // Convert old style format tags to markdown
    markdown = Blackout.toMarkdown(markdown);
    
    // Encode any markdown chars inside code blocks
    markdown = Ember.Blackout.encodeMarkdownCode(markdown);
    
    // Disable html, so we can add our own
    if(!this.get('allowHtml')){
      markdown = this.disableHTML(markdown);
    }
    
    // Update any remote version links, to testing links, if we're testing
    markdown = this.modifyLinksWhenTesting(markdown);
    
    // Process BR markdown
    markdown = this.processVideos(markdown);
    markdown = this.cleanBRImages(markdown);
    markdown = this.processImages(markdown);
    markdown = this.processQuotes(markdown);
    markdown = this.detectSpecialLinks(markdown);
    markdown = this.detectUsers(markdown);
    //print(markdown);
    
    // Unencode special chars
    markdown = markdown.decodeMarkdownChars();
    
    // Process local links so that they won't reload the app
    markdown = this.processNakedLinks(markdown);
    markdown = this.processLocalLinks(markdown);
    
    this.set('markdown', markdown);

  }),
  
  detectUsers(markdown){
    
    return markdown.replace(/@([a-zA-Z0-9\-_]+)(?=[^a-zA-Z0-9]?\s)|@[\[\('"\{]([a-zA-Z0-9\-_ ]+)[\]\)'"\}]/g,( fullMatch, unquotedUsername, quotedUsername)=>{
      
      return this.get('text').decorateUsername( unquotedUsername ? unquotedUsername : quotedUsername );
      
    });
    
  },
  
  modifyLinksWhenTesting(markdown){
    
    var currentHost = window.location.host;
    
    // If we are testing (running from an IP based host, or localhost)
    if(currentHost.match(/(?:[0-9]{1,3}\.){3}[0-9]{1,3}/) || currentHost==='localhost'){
      
      let primarySiteUrl = config.primarySiteUrl;
      
      return markdown.replace(this.get('nakedUrlRegex'),function( fullMatch, url, protocol, host){
        
        // ---------------------------------------------- BR New
        
        // -------------------- Test site
        
        if( host === primarySiteUrl){
          return fullMatch.replace('https://','http://').replace(primarySiteUrl,currentHost);
        }
        
        // If we get here, no valid link was detected
        return fullMatch;
        
      });
      
    } else {
      return markdown;
    }
      
  },
  
  detectSpecialLinks(markdown){
    
    return markdown.replace(/(?:!{0,2}\$?\[(.+)\]([\(\:]) *)?((?:http(s)?:\/\/.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b(?:(?:\[[-a-zA-Z0-9@:%_\+.,~#?&\/\/=]*\]|[-a-zA-Z0-9@:%_\+.,~#?&\/\/=]*)*))(?:\))?/gi,( fullMatch, altTextOrRefKey, normalUrlOrRef, url)=>{
      
      var store = this.get('store'),
          res,youth,nat,u20,ext,className,
          visibleText = '<img src="/assets/loaders/text-loader.gif" class="text-loader">';
      
      // Determine alt text
      var altText = normalUrlOrRef!==':' ? altTextOrRefKey : null;
      
      // Ensure not a markdown image or video
      // Ensure not a reference URL
      var first = fullMatch.substr(0,1);
      if(first === '!' || first === '$' || normalUrlOrRef === ':'){
        return fullMatch;
      }
      
      // Clean up
      url = Blackout.assertURL(url.trim().rtrim('].)').trim());
      
      var last = fullMatch.substr(-1);
      if(last!=='.'){
        last = '';
      }
      last += '  ';
      first = '';
      
      // ---------------------------------------------- BR Original
      
      // -------------------- Player
      
      res = url.match(/club\.squad(\.youth)?\.php#.*player=([0-9]+)/i);
      
      if(res){
        let itemid = res[2];
        youth = res[1];
        ext = youth?'_youth':'';
        className = 'md_player_link_'+itemid;
        
        if(altText){
          visibleText = altText;
        } else {
          
          // Load player
          var playerName = store.findRecord('player', itemid).then(function(data){
            
            $('.'+className).html(data.get('name'));
            return data.get('name');
            
          });
          if(typeof(playerName)==='string'){
            visibleText = playerName;
          }
          
        }
        
        return first+'<i class="icon-logo icon-md icon-vcenter"></i><a href="'+url+'" class="'+className+'">'+visibleText+'</a>'+last;
        
      }
      
      // -------------------- Fixture
      
      res = url.match(/tools\.live\.scoring\.php.*?[&#]fixture=([0-9]+).*?(?:[&#]youth=(1))?.*?(?:[&#]nat=(1))?.*?(?:[&#]u20=(1))?/i);
      
      if(res){
        let itemid = res[1];
        youth = res[2];
        nat = res[3];
        u20 = res[4];
        ext = youth?'_youth':(nat?'_nat':(u20?'_u20':''));
        className = 'md_fixture_link'+ext+'_'+itemid;
        
        if(altText){
          visibleText = altText;
        } else {
          
          let query = {
            filter: {
              id: itemid
            },
            include: 'home-club,guest-club'
          };
          
          var type = youth?'youthFixture':(nat?'nationalFixture':(u20?'u20Fixture':'fixture')) + '';
          
          // Load fixture
          var fixtureText = store.queryRecord(type, query )
          //var fixtureText = store.findRecord(type, itemid, { include: 'home-club,guest-club' } )
          .then(function(data){
            
            var item = data.get('firstObject');
            var homeClubName = item.get('homeClub.name');
            var guestClubName = item.get('guestClub.name');
            
            var text = homeClubName + ' v ' + guestClubName;
            $('.'+className).html(text);
            
            return text;
            
          });
          if(typeof(fixtureText)==='string'){
            visibleText = fixtureText;
          }
          
        }
        
        return '<i class="icon-ball icon-vcenter"></i> <a href="'+url+'" class="'+className+'">'+visibleText+'</a>'+last;
        
      }
      
      // -------------------- Conversation
      
      res = url.match(/global\.clubrooms\.php#.*conversation=([0-9]+)/i);
      
      if(res){
        let itemid = res[1];
        className = 'md_conv_link_'+itemid;
        var isPrivateConv = false;
        
        if(altText){
          visibleText = altText;
        } else {
          
          // Load conversation
          var convName = store.findRecord('conversation', itemid).then((data)=>{
            
            $('.'+className).html(data.get('name'));
            Blackout.fadeIn($('.'+className));
            return data.get('name');
            
          },()=>{
            
            let text = this.get('locale').htmlT('clubrooms.private-conv');
            isPrivateConv = true;
            
            // Conversation was not found or inaccessible (assume latter)
            $('.'+className).replaceWith(text);
            return text;
            
          });
          if(typeof(convName)==='string'){
            visibleText = convName;
          }
          
        }
        
        if(isPrivateConv){
          return first+'<i class="icon-conv icon-vcenter"></i>'+visibleText+last;
        } else {
          return first+'<i class="icon-conv icon-vcenter"></i><a href="'+url+'" class="'+className+'">'+visibleText+'</a>'+last;
        }
        
        
      }
      
      // -------------------- Lounge
      
      res = url.match(/global\.clubrooms\.php#.*lounge=([0-9]+)/i);
      
      if(res){
        let itemid = res[1];
        className = 'md_lounge_link_'+itemid;
        
        if(altText){
          visibleText = altText;
        } else {
          
          // Load item
          let itemName = store.findRecord('lounge', itemid).then(function(data){
            
            $('.'+className).html(data.get('name'));
            Blackout.fadeIn($('.'+className));
            return data.get('name');
            
          });
          if(typeof(itemName)==='string'){
            visibleText = itemName;
          }
          
        }
        
        return first+'<i class="icon-chat icon-smd icon-vcenter"></i> <a href="'+url+'" class="'+className+'">'+visibleText+'</a>'+last;
        
      }
      
      // -------------------- League
      
      res = url.match(/club\.league(\.youth)?\.php.*#.*id=([0-9]+)/i);
      
      if(res){
        let itemid = res[2];
        youth = res[1];
        ext = youth?'_youth':'';
        className = 'md_league'+ext+'_link_'+itemid;
        
        if(altText){
          visibleText = altText;
        } else {
          
          // Load item
          let itemName = store.findRecord((youth?'youth-':'')+'league', itemid).then(function(data){
            
            $('.'+className).html(data.get('name'));
            return data.get('name');
            
          });
          if(typeof(itemName)==='string'){
            visibleText = itemName;
          }
          
        }
        
        return first+'<i class="icon-list-numbered icon-vcenter"></i><a href="'+url+'" class="'+className+'">'+visibleText+'</a>'+last;
        
      }
      
      // -------------------- Club
      
      res = url.match(/club\.lobby\.php.*#.*id=([0-9]+)|global\.national\.php.*iso=([A-Z]{2}).*type=([0-9])/i);
      
      if(res){
        let itemid = res[1];
        let natIso = res[2];
        let natType = parseInt(res[3]);
        let modelPre = natType === 1 ? 'national-' : (natType === 2 ? 'u20-' : '');
        let iconName = 'home';
        ext = (natType===1?'_nat':(natType===2?'_u20':''));
        if(natIso){
          itemid = natIso;
        }
        className = 'md_club'+ext+'_link_'+itemid;
        
        if(altText){
          visibleText = altText;
        } else {
          
          let itemName = '';
          
          if(natIso){
            
            let query = {
              filter: {
                'country.id': natIso,
              },
            };
            
            // Query item
            itemName = store.queryRecord(modelPre+'club', query).then(function(data){
              
              let item = data.get('firstObject');
              $('.'+className).html(item.get('name'));
              return item.get('name');
              
            });
            
            iconName = 'flag-filled';
            
          } else {
            
            // Load item
            itemName = store.findRecord('club', itemid).then(function(data){
              
              $('.'+className).html(data.get('name'));
              return data.get('name');
              
            });
            
          }
          if(typeof(itemName)==='string'){
            visibleText = itemName;
          }
          
        }
        
        return first+'<i class="icon-'+iconName+' icon-md icon-vcenter"></i><a href="'+url+'" class="'+className+'">'+visibleText+'</a>'+last;
        
      }
      
      // ---------------------------------------------- BR New
      
      // TODO: Add link detection support here as site features are added
      
      // If we get here, no valid link was detected
      return fullMatch;
      
    });
    
  },
  
  disableHTML(markdown){
    return markdown.replace(/</g,'&lt;');
  },
  
  /**
   * Supports embeded videos
   * 
   * To embed a video, a format similar to image markdown is used, except we use a dollar instead of exclamation:
   * $[Video title](video url)
   * 
   * Code adapted from showdown image subparser
   */
  processVideos(markdown) {
    'use strict';

    var inlineRegExp = /\$\[(.*?)]\s?\([ \t]*<?(\S+?)>?[ \t]*\)/g;

    let writeVideoTag = (wholeMatch, altText, url)=>{

      if (url === '' || url === null) {
        return wholeMatch;
      }
      url = Ember.Blackout.assertURL(url);
      
      var videoId;
      
      var isYoutube = url.search(/youtu\.?be/)>=0;
      if(isYoutube){
        videoId = this.getYoutubeId(url);
        if( window.browsers.standalone ){
          url = 'https://www.youtube-nocookie.com/embed/'+videoId;
        } else {
          url = 'https://www.youtube.com/embed/'+videoId;
        }
      }
      
      var isVimeo = url.search(/vimeo\.com/)>=0;
      if(isVimeo){
        videoId = this.getVimeoId(url);
        url = 'https://player.vimeo.com/video/'+videoId;
      }

      altText = altText.replace(/"/g, '&quot;');
      altText = this.escapeCharacters(altText, '*_', false);
      url = this.escapeCharacters(url, '*_', false);
      var result = '<div class="video-container" aria-label="' + altText + '"><iframe src="' + url + '" frameborder="0" width="560" height="315"></iframe></div>';

      return result;
      
    };

    // Handle inline videos:  $[alt text](url)
    markdown = markdown.replace(inlineRegExp, writeVideoTag);

    return markdown;
    
  },
  
  /**
   * Fix URLs without protocol
   * Regex from showdown source code
   */
  processImages(markdown) {
    'use strict';

    var inlineRegExp = /!\[(.*?)]\s?\([ \t]*<?(\S+?)>?(?: =([*\d]+[A-Za-z%]{0,4})x([*\d]+[A-Za-z%]{0,4}))?[ \t]*(?:(['"])(.*?)\6[ \t]*)?\)/g;

    function writeImageTag (wholeMatch, altText, url) {

      if (url === '' || url === null) {
        return wholeMatch;
      }
      var fixedUrl = Ember.Blackout.assertURL(url);

      return wholeMatch.replace(url,fixedUrl);
    }

    markdown = markdown.replace(inlineRegExp, writeImageTag);

    return markdown;
    
  },
  
  /**
   * Don't leave any naked links so that we can more accurately process for local links next
   */
  processNakedLinks(markdown){
    
    return markdown.replace(this.get('nakedUrlRegexOuter'),function( fullMatch, first, url, protocol, host, path, last){
      
      if(first.trim()==='' && last.trim()===''){
        //log(first+'['+url+'](' + url + ')'+last);
        return first + '['+url+'](' + url + ')' + last;
      }
      
      return fullMatch;
      
    });
    
  },
  
  processLocalLinks(markdown){
    
    var currentHost = window.location.host;
    
    /**
     * old regex with catastrophic backtracking *)*
     * Caused chrome to hang on any markdown with no matches
     * 
     * /(?:(!{0,2}\$?)\[(.*)\]\( *|(<a .*?href="))((?:http(?:s)?:\/\/)?(.[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b|(?:[0-9]{1,3}\.){3}[0-9]{1,3}(?::[0-9]{1,5})?)((?:\[[-a-zA-Z0-9@:%_\+.,~#?&\/\/=]*\]|[-a-zA-Z0-9@:%_\+.,~#?&\/\/=]*)*))(?:\)|(".*<\/a>))/gi
     */
    
    return markdown.replace(/(?:(!{0,2}\$?)\[(.*)\]\( *|(<a .*?href="))((?:http(?:s)?:\/\/)?(.[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b|(?:[0-9]{1,3}\.){3}[0-9]{1,3}(?::[0-9]{1,5})?)((?:\[[-a-zA-Z0-9@:%_\+.,~#?&\/\/=]*\]|[-a-zA-Z0-9@:%_\+.,~#?&\/\/=]*)))(?:\)|(".*<\/a>))/gi,function( fullMatch, mediaModifier, markdownText, anchorStart, url, host, path, anchorEnd){
      
      // Make sure this is not a media link
      if(Ember.Blackout.isEmpty(mediaModifier)){
        
        // Make sure the host is local
        if(host === currentHost){
          let $itemLink;
          
          // If this is an anchor link
          if(!Ember.Blackout.isEmpty(anchorStart)){
            $itemLink = $(anchorStart+path+anchorEnd);
          } else {
            $itemLink = $('<a href="'+path+'">'+markdownText+'</a>');
          }
          
          $itemLink.on('click',function(e){
            e.preventDefault();
            Ember.Blackout.transitionTo(path);
            return false;
          });
          
          return Ember.Blackout.eventedHTML($itemLink);
          
        }
        
      }
      
      return fullMatch;
      
    });
    
  },
  
  /**
   * Clean up image markdown used for BR purpose to prevent image being used as primary
   * !![txt](url)
   */
  cleanBRImages(markdown) {
    'use strict';

    var regExp = /!!\[/g;

    function writeImageTag (wholeMatch) {
      return wholeMatch.substr(1);
    }

    markdown = markdown.replace(regExp, writeImageTag);

    return markdown;
    
  },
  
  /**
   * Taken from showdown source
   */
  escapeCharactersCallback(wholeMatch, m1) {
    'use strict';
    var charCodeToEscape = m1.charCodeAt(0);
    return '~E' + charCodeToEscape + 'E';
  },

  /**
   * Taken from showdown source
   */
  escapeCharacters(text, charsToEscape, afterBackslash) {
    'use strict';
    // First we have to escape the escape characters so that
    // we can build a character class out of them
    var regexString = '([' + charsToEscape.replace(/([\[\]\\])/g, '\\$1') + '])';

    if (afterBackslash) {
      regexString = '\\\\' + regexString;
    }

    var regex = new RegExp(regexString, 'g');
    text = text.replace(regex, this.escapeCharactersCallback);

    return text;
  },
  
  getVimeoId(url){
    var regExp = /^.*(vimeo\.com\/(video\/)?)([^#\&\?]*).*/;
    var match = url.match(regExp);

    if (match && !isNaN(match[3]) ) {
        return match[3];
    } else {
        return 'error';
    }
  },
  
  getYoutubeId(url) {
    var regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    var match = url.match(regExp);

    if (match && match[2].length === 11) {
        return match[2];
    } else {
        return 'error';
    }
  },
  
  /**
   * Supports BR style quotes with titles
   * 
   * All blockquotes will have a title QUOTE by default
   * 
   * To quote a user (QUOTING: User):
   * > @[username] quote text here
   * 
   * The square brackets can be omitted if the username does not include spaces
   * 
   * TODO: Rewrite this using wisdom from the processVideo function adapted from showdown
   */
  processQuotes(markdown) {
    
    var quoteLocation,lastQuoteLocation = null;
    var cursor = 0;
    
    let checkAllLinesEmpty = function(i,line){
      if( i > 0 && i < lines.length-1 ){
        if(line.trim()!==''){
          allLinesEmpty = false;
          return false;
        }
      }
    };

    do {
      
      // Find next unprocessed quote
      // Help from https://regex101.com/
      quoteLocation = markdown.regexIndexOf(/(\n|^) *\> *@?(?! *<div class="quote-header">)/, cursor);
      
      // If one exists
      if (quoteLocation >= 0) {
        
        var isNewQuote = true;
        
        // Determine if there is a quoted user
        var userQuoteLocation = markdown.regexIndexOf(/(\n|^) *\> *@(?! *<div class="quote-header">)/, quoteLocation);
        var isUserQuote = userQuoteLocation === quoteLocation;
        
        // User quotes are always considered 'new' quotes with their own title
        // However we still need to know if this is a new quote block or not so we can style the title slightly differently
        
        // Check if this line is part of a quote already titled
        if( lastQuoteLocation!==null ){
          
          // Get lines inbetween this and the last
          var inBetween = markdown.substr(lastQuoteLocation, quoteLocation - lastQuoteLocation + 1);
          
          // Check each line, if not empty then there is a quote break
          var lines = inBetween.split("\n");
          var allLinesEmpty = true;
          $.each(lines,checkAllLinesEmpty);
          
          // If one or more lines contain non-quote content, this is a new quote
          isNewQuote = !allLinesEmpty;
          
        }

        var realStart = markdown.indexOf('>', quoteLocation) + 1;
        
        // Track cursor
        cursor = realStart + 1;
        
        if(isUserQuote || isNewQuote){
          
          if( isUserQuote ){

            /**
             * Quoting a user
             */
            
            var usernameStart = markdown.indexOf('@', quoteLocation) + 1;
            var usernameFirstChar = markdown.substr(usernameStart, 1);
            var realEnd,usernameEnd;
            
            // Check for quoted username (allows usernames to contain spaces)
            if ( usernameFirstChar.search(/['"`(\[]/)===0 ) {
              
              usernameStart++;
              realEnd = markdown.regexIndexOf(/['"`)\]]/, usernameStart+1)+1;
              usernameEnd = realEnd-1;
              if (usernameEnd < 0) {
                continue;
              }
            
            // Otherwise just look for the first space
            } else {

              usernameEnd = markdown.indexOf(' ', usernameStart);
              realEnd = usernameEnd;

            }

            let realLength = realEnd - realStart;
            let usernameLength = usernameEnd - usernameStart;
            
            // Make sure username exists
            if (usernameLength > 0) {

              let username = this.get('text').decorateUsername(markdown.substr(usernameStart, usernameLength));

              let html = '<div class="quote-header '+(!isNewQuote?'quote-extend':'')+'"><span class="quote-title">'+this.get('locale').htmlT('markdown.quoting')+'</span> <span class="quote-user">' + username + '</span></div>';

              // Replace in markdown
              markdown = markdown.substrReplace(html, realStart, realLength );
              
            } else {
              
              isUserQuote = false;
              
            }
            
          }
          
          if( !isUserQuote ){

            /**
             * General quotes
             */
            
            let html = '<div class="quote-header"><span class="quote-title">'+this.get('locale').htmlT('markdown.quote')+'</span></div>';
            
            // Replace in markdown
            markdown = markdown.substrReplace(html, realStart + 1, 0);
            
          }
          
        }
        
        lastQuoteLocation = realStart;

      }

    } while (quoteLocation >= 0);

    return markdown;

  },

});
