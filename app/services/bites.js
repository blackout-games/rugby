import Ember from 'ember';
var $ = Ember.$;
var bitesName = 'bites';

export default Ember.Service.extend({
  locals: Ember.inject.service(),
  
  loadItems: function(){
    
    var items = this.get('locals',true).read(bitesName);
    if(typeof(items)==='object'){
      this.set(bitesName,items,true);
    } else {
      this.set(bitesName,{},true);
    }
    
    this.updateAJAX();
    
  }.on('init'),
  
  saveItems: function(){
    
    var items = this.get(bitesName,true);
    this.get('locals',true).put(bitesName,items);
    this.setupAJAXSuccessListener();
    
  },
  
  setupAJAXSuccessListener: function(){
    
    var self = this;
    /*
    $( document ).ajaxSuccess(function( event, xhr ) {
      var setBites = xhr.getResponseHeader('Set-Bites');
      
      if(setBites!==null){
        setBites = setBites.split('; ');
        $.each(setBites,function(i,setBite){
          if(setBite!==''){
            
            if(setBite.indexOf('=')>=0){
              var parts = setBite.split('=');
              if(parts.length===2){
                var key = parts[0].trim();
                var val = parts[1].trim();
                if(key!=='' && val!==''){
                  self.set(key,val);
                }
              }
            }
            
          }
        });
      }
    });*/
    
  }.on('init'),
  
  updateAJAX: function(){
    //print(this.header());
    /*
    $.ajaxSetup({
        headers: {
          'Bites': this.header(),
        },
    });
    */
  },
  
  header: function(){
    
    var items = this.get( bitesName, true );
    var keyvals = [];
    $.each(items,function(key,val){
      keyvals.push( key + '=' + val );
    });
    return keyvals.join('; ');
    
  },
  
  get: function( key, internal ){
    
    if( internal ){
      return this._super( key );
    } else {
      var items = this._super( bitesName );
      
      return items[key];
    }
    
  },
  
  set: function( key, val, internal ){
    
    if( internal ){
      this._super( key, val );
      
    } else {
      
      var items = this.get( bitesName, true );
      if(val===null||val==='null'){
        this.remove(key);
      } else {
        items[key] = val;
        this.set( bitesName, items, true );
        this.saveItems();
      }
      
    }
    
  },
  
  remove: function( key ){
    
    var items = this.get( bitesName, true );
    delete items[key];
    this.set( bitesName, items, true );
    this.saveItems();
    
  },
  
  /**
   * Supports multiple headers of the same key, returned as an object
   */
  getMultiResponseHeaders: function (headerStr,header) {
    var headers = [];
    if (!headerStr) {
      return headers;
    }
    var headerPairs = headerStr.split('\u000d\u000a');
    for (var i = 0, len = headerPairs.length; i < len; i++) {
      var headerPair = headerPairs[i];
      var index = headerPair.indexOf('\u003a\u0020');
      if (index > 0) {
        var key = headerPair.substring(0, index);
        var val = headerPair.substring(index + 2);
        if(key===header){
          headers.push(val);
        }
      }
    }
    return headers;
  },
  
});
