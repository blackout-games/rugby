import Ember from 'ember';
var $ = Ember.$;
var bitesName = 'bites';

export default Ember.Service.extend({
  locals: Ember.inject.service(),
  
  loadItems: Ember.on('init', function(){
    
    var items = this.get('locals',true).read(bitesName);
    if(typeof(items)==='object'){
      this.set(bitesName,items,true);
    } else {
      this.set(bitesName,{},true);
    }
    
    this.updateAJAX();
    
  }),
  
  saveItems() {
    
    var items = this.get(bitesName,true);
    this.get('locals',true).write(bitesName,items);
    this.setupAJAXSuccessListener();
    
  },
  
  setupAJAXSuccessListener: Ember.on('init', function(){
    
    $( document ).ajaxSuccess(( event, xhr )=>{
      var setBites = xhr.getResponseHeader('Set-Bites');
      var hash48 = xhr.getResponseHeader('Hash-48h');
      this.set('latestHash48',hash48);
    
      if(setBites!==null){
        setBites = setBites.split('; ');
        $.each(setBites,(i,setBite)=>{
          if(setBite!==''){
            
            if(setBite.indexOf('=')>=0){
              var parts = setBite.split('=');
              if(parts.length===2){
                var key = parts[0].trim();
                var val = parts[1].trim();
                if(key!=='' && val!==''){
                  this.set(key,val);
                }
              }
            }
            
          }
        });
      }
    });
    
  }),
  
  updateAJAX() {
    //print(this.header());
    
    $.ajaxSetup({
        headers: {
          'Bites': this.header(),
          'Hash-48h': this.get('latestHash48'),
        },
    });
    
  },
  
  header() {
    
    var items = this.get( bitesName, true );
    var keyvals = [];
    $.each(items,function(key,val){
      keyvals.push( key + '=' + val );
    });
    return keyvals.join('; ');
    
  },
  
  get(key, internal) {
    
    if( internal ){
      return this._super( key );
    } else {
      var items = this._super( bitesName );
      
      return items[key];
    }
    
  },
  
  set(key, val, internal) {
    
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
  
  remove(key) {
    
    var items = this.get( bitesName, true );
    delete items[key];
    this.set( bitesName, items, true );
    this.saveItems();
    
  },
  
  /**
   * Supports multiple headers of the same key, returned as an object
   */
  getMultiResponseHeaders(headerStr, header) {
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
