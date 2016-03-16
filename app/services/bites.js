import Ember from 'ember';
var $ = Ember.$;
var bitesName = 'bites';

export default Ember.Service.extend({
  locals: Ember.inject.service(),
  
  loadItems: Ember.on('init', function(){
    
    var items = this.get('locals').read(bitesName);
    if(typeof(items)==='object'){
      this.set(bitesName,items);
    } else {
      this.set(bitesName,{});
    }
    
    this.updateAJAX();
    
  }),
  
  saveItems() {
    
    var items = this.get(bitesName);
    this.get('locals').write(bitesName,items);
    
    /**
     * DO NOT CALL THIS FROM HERE OR IT CREATES A LOOP
     * 
     * The loop is created if you call setBite within the function sent to ajaxSuccess below. Not sure why since ajaxSuccess shouldn't actually run the given function, but it happens slowly over time. The more you click around, the slower the app gets.
     * 
     * setupAJAXSuccessListener should be called once on init and that's it
     */
    //this.setupAJAXSuccessListener();
    
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
                  this.setBite(key,val);
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
    
    var items = this.get( bitesName );
    var keyvals = [];
    $.each(items,function(key,val){
      keyvals.push( key + '=' + val );
    });
    return keyvals.join('; ');
    
  },
  
  getBite(key) {
    
    var items = this.get( bitesName );
    return items[key];
    
  },
  
  setBite(key, val) {
    
    var items = this.get( bitesName );
    if(val===null||val==='null'){
      this.remove(key);
    } else {
      items[key] = val;
      this.set( bitesName, items );
      this.saveItems();
    }
    
  },
  
  remove(key) {
    
    var items = this.get( bitesName );
    delete items[key];
    this.set( bitesName, items );
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
