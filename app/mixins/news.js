import Ember from 'ember';
var $ = Ember.$;

export default Ember.Mixin.create({
  
  maxLength: 600,
  
  processNews( articles, lastViewed, enforceMaxLength ){
    
    var self = this;
    
    articles.forEach(function(article){
      
      self.processShortArticle( article, lastViewed, enforceMaxLength );
      
    });
    
  },
  
  processShortArticle( article, lastViewed, enforceMaxLength ){
    
    // Splits
    var intro = this.processBody(article, true);
      
    if( !enforceMaxLength || intro.length <= this.maxLength){
      article.set('short',intro);
    } else {
      article.set('short',intro.substr(0,this.maxLength) + "...");
    }
    
    // Is news new?
    article.set('lastViewed',lastViewed);
    
  },
  
  processArticle(article){
    
    // Set full
    article.set('fullBody', this.processBody(article) );
    
  },
  
  processBody(article,introOnly=false){
    
    var body = article.get('body');
    var wasSplit = false;
    
    if(body.indexOf('[split]')>=0){
      
      var parts = body.split('[split]');
      wasSplit = true;
      
    } else {
      
      var parts = [];
      
      var shortFound = false;
      var bodyCopy = body.toString();
      var cursor = 0;
      do {
        var pos = bodyCopy.search(/[\.\!\?\:][ <]/);
        var realPos = pos + cursor;
        if( realPos >= 22 ){
          shortFound = true;
          parts[0] = body.substr(0,realPos+1);
          parts[1] = body.substr(realPos+1);
        } else if(pos == -1){
          shortFound = true;
          parts[0] = body;
        } else {
          bodyCopy = body.substr(realPos+1);
          cursor = realPos+1;
        }
      } while(!shortFound);
      
    }
    
    
    if( parts.length === 2 ){
      
      // Clean up the intro
      var intro = Ember.Blackout.trimBr(parts[0]);
      
      if(wasSplit){
        
        // If intro ends with any of these
        var phrases = [
          'click','cick','click for','clicking','find out','click to get','read','read on to find out'
        ];
        
        $.each(phrases,function(index,phrase){
          if( intro.substr( -(phrase.length) ) == phrase ){
            
            // Remove everything between end and specified characters - if short enough
            var lastMost = -1;
            var chars = ['.','!','?',']',')','>','-'];
            $.each(chars,function(i,char){
              
              let pos = intro.lastIndexOf(char);
              if(pos > lastMost){
                lastMost = pos;
              }
              
            });
            
            if( intro.length - lastMost <= 70 ){
              // Chop end off string
              intro = intro.substr(0,lastMost+1);
            }
            
            return false;
          }
        });
      
      }
      
      // If last character is alphanumeric
      var last = intro.substr(-1);
      if( last.search( /[a-zA-Z0-9]/i )>=0 ){
        
        // Add full stop
        intro = intro + '.';
        
      }
      
      if(!introOnly||wasSplit){
        
        // Clean up body
        var body = Ember.Blackout.trimBr(parts[1]);
        body = intro + '<br><br>' + body;
        
        // Switch to paragraphs
        if(!wasSplit){
          body = Ember.Blackout.br2p(body);
        }
        
      } else {
        
        intro = intro.replace(/<br>/gi,' ');
        var body = intro;
        
      }
      
      if(!wasSplit){
        article.set('hasMoreToRead',true);
      }
      
    } else if( parts.length === 1 ) {
      
      var body = Ember.Blackout.trimBr(parts[0]);
      
      if(!introOnly){
        
        // Switch to paragraphs
        body = Ember.Blackout.br2p(body);
        
      } else {
        body = body.replace(/<br>/gi,' ');
      }
      
    }
    
    if(wasSplit){
      article.set('body',body);
      return this.processBody(article,introOnly);
    } else {
      return body;
    }
      
  },
  
});
