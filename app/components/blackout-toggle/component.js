import Ember from 'ember';
const { $ } = Ember;

export default Ember.Component.extend({
  
  classNames: ['inline-block'],
  
  setup: Ember.on('didInsertElement',function(){
    
    this.$('input').show().addClass('hidden-but-accessible');
    
    this.setupEvents();
    
    if(this.get('name')){
      this.$('input').attr('name',this.get('name'));
      this.$('input').attr('id',this.get('name'));
    }
    
  }),
  
  setupEvents(){
    
    let $input = this.$('input');
    let clickIsLocal = false;
    
    // Create bound functions
    if(!this.get('docClickBound')){
      this.set('docClickBound',Ember.run.bind(this,this.docClick));
    }
    
    this.$().on('click',()=>{
      this.addFocus();
      clickIsLocal = false;
    });
    
    this.$().on('mousedown touchstart',()=>{
      clickIsLocal = true;
    });
    
    $input.on('focus',()=>{
      this.addFocus(true);
    });
    
    $input.on('blur',()=>{
      this.removeFocus(true,clickIsLocal);
    });

    // Close the select element if the target it´s not the select element or one of its descendants
    $(document).on( 'mousedown touchstart', this.get('docClickBound'));
    
  },
  
  cleanup: Ember.on('didInsertElement',function(){
    
    if(this.get('docClickBound')){
      
      this.$().off('click');
      
      $(document).off('mousedown touchstart', this.get('docClickBound'));
      
      this.set('docClickBound',false);
      
    }
    
  }),
  
  /**
   * Handle a click somewhere other than the slider
   */
  docClick(e){
    var target = e.target;
    
    if( target !== this.$()[0] && !$(target).hasParent( this.$() )) {
      
      this.removeFocus();
      
    }
  },
  
  addFocus(fromInput){
    if(!fromInput){
      this.$('input').focus();
    }
    this.$('.x-toggle-btn').addClass('focus');
  },
  
  removeFocus(fromInput,clickIsLocal){
    if(!fromInput){
      this.$('input').blur();
    }
    if(!clickIsLocal){
      this.$('.x-toggle-btn').removeClass('focus');
    }
  },
  
  actions: {
    onToggle(val){
      if(this.attrs.onToggle && typeof this.attrs.onToggle === 'function'){
        this.attrs.onToggle(val);
      }
    },
  },
  
});
