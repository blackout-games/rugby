import Ember from 'ember';
var $ = Ember.$;

export default Ember.Mixin.create({
  
  maxIntroLength: 125,
  
  processNews( articles, lastViewed, enforcemaxIntroLength ){
    
    articles.forEach((article)=>{
      
      this.processArticle( article, lastViewed, enforcemaxIntroLength );
      
    });
    
  },
  
  processArticle(article, lastViewed, enforcemaxIntroLength){
    
    // No need if already processed
    if( article.get('short') ){
      return;
    }
    
    var intro;
    var body = article.get('body');
    var wasSplit = false;
    var parts;
    
    // Remove "Take me to the revamp"
    body = body.replace(/\r?\n\r?\n\*\*_\*\*_.*?_\*\*_\*\*/,'');
    
    if(body.indexOf('[split]')>=0){
      
      parts = body.split('[split]');
      wasSplit = true;
      
    } else {
      parts = [];
      
      var shortFound = false;
      var bodyCopy = body.toString();
      var cursor = 0;
      do {
        var pos = bodyCopy.search(/[\.\!\?\:][ <\n]/);
        
        var realPos = pos + cursor;
        if( realPos >= 22 ){
          shortFound = true;
          parts[0] = body.substr(0,realPos+1);
          parts[1] = body.substr(realPos+1);
        } else if(pos === -1){
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
      intro = parts[0].trim();
      
      if(wasSplit){
        
        // If intro ends with any of these
        var phrases = [
          'click','cick','click for','clicking','find out','click to get','read','read on to find out'
        ];
        
        $.each(phrases,function(index,phrase){
          
          if( intro.substr( -(phrase.length) ) === phrase ){
            
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
        
      article.set('body',intro + "\n\n" + parts[1]);
      
      if(wasSplit){
        
        // Process again to find first sentence, now that [split] is gone, and sentence end has been cleaned up.
        
        this.processArticle(article, lastViewed, enforcemaxIntroLength);
        
        return;
        
      } else {
        
        article.set('hasMoreToRead',true);
        
      }
      
    } else {
      
      intro = parts[0];
      
    }
    
    // Remove newlines for short version
    intro = intro.stripMarkdown().replace(/\n/gi,' ');
    
    if( !enforcemaxIntroLength || intro.length <= this.maxIntroLength){
      article.set('short',intro);
    } else {
      article.set('short',intro.substr(0,this.maxIntroLength) + "…");
    }
    
    // Is news new?
    article.set('lastViewed',lastViewed);
    
    // Check for image usable as primary
    var primaryImg;
    
    // Obfuscate any markdown chars in code blocks
    let tmpBody = Ember.Blackout.encodeMarkdownCode(article.get('body'));
    
    var images = tmpBody.match(/(!)?!\[(.*?)]\s?\([ \t]*<?(\S+?)>?[ \t]*\)/g);
    if(images){
      $.each(images,function(i,img){
        
        // First two characters
        var indicator = img.substr(0,2);
        
        // Can we use this image
        if(indicator!=='!!'){
          
          // Get url
          var details = img.match(/!\[.*?]\s?\([ \t]*<?(\S+?)>?[ \t]*\)/);
          primaryImg = details[1];
          
          // Remove image from article body
          // This allows journos to have an image used as primary, but not in the body
          // If they want to have the image in the body as well, they simply need to add it twice.
          article.set('body',article.get('body').replace(details[0],''));
          
          return false;
        }
        
      });
      
      if(primaryImg){
        article.set('img',primaryImg);
      }
    }
    
    
  },
  
});
