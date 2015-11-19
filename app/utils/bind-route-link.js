import Ember from 'ember';

export default function bindRouteLink( route, html ) {
  
  let id;
  let idFoundInHtml = false;
  
  if(html){
    // Check for id already in html
    let idMatch = html.match(/^\s*<a.*?id="(.+?)"/);
    if(idMatch){
      id = idMatch[1];
      idFoundInHtml = true;
    }
  }
  
  // Generate a random id
  if(!idFoundInHtml){
    id = 'blackout-' + Ember.Blackout.generateId();
  }
  
  Ember.run.next(function(){
    Ember.$('#'+id).on('click',function(e){
      e.preventDefault();
      Ember.Blackout.transitionTo(route);
      return false;
    });
  });
  
  if(html){
    if(idFoundInHtml){
      return html;
    } else {
      return html.replace(/^\s*<a/,'<a id="'+id+'"');
    }
  } else {
    return id;
  }
}
