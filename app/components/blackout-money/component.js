import Ember from 'ember';

export default Ember.Component.extend({
  tagName: 'input',
  value: 0,
  
  setup: Ember.on('didInsertElement',function(){
    
    this.$().prop('type','text');
    this.monetize(true);
    
    this.$().on('paste',()=>{
      this.monetizeOnChange(this.$().val());
    });
    
    this.$().on('keydown',(e)=>{
      let modifier = e.metaKey||e.ctrlKey||e.shiftKey||e.altKey;
      let paste = modifier && e.keyCode===86;
      
      if(paste){
        
        // Wait for value to change
        this.monetizeOnChange(this.$().val());
        
      } else if(!modifier){
        
        this.monetizeOnChange(this.$().val());
        
      }
      
    });
    
    this.$().on('focus',()=>{
      if(this.attrs.onFocus && typeof this.attrs.onFocus === 'function'){
        this.attrs.onFocus();
      }
    });
    
    this.$().on('blur',()=>{
      if(this.attrs.onBlur && typeof this.attrs.onBlur === 'function'){
        this.attrs.onBlur();
      }
    });
    
  }),
  
  receiveNewValue: Ember.on('didUpdateAttrs',function(opts){
    
    if(this.attrChanged(opts,'value')){
      this.monetize(true);
    }
    
  }),
  
  cleanup: Ember.on('willDestroyElement',function(){
    
    this.$().off('keydown keyup focus blur');
      
  }),
  
  monetize(initial){
  
    let value;
    
    if(initial){
      value = parseFloat(this.get('value'));
    } else {
      value = this.$().val().replace(/[\$, ]/g,'');
      value = parseFloat(value);
    }
    
    /**
     * Set money value
     */
    if(!isNaN(value)){
      // Set initial money values
      let money = '$' + parseFloat(value).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
      
      // Save carat position
      let start = this.$()[0].selectionStart;
      let end = this.$()[0].selectionEnd;
      
      // Check how many extra chars before carat
      let preVal = this.$().val();
      let numExtrasBefore = 0, numExtrasAfter = 0;
      preVal.replace(/[\$,]/g,(fullMatch,offset)=>{
        if(offset<start){
          numExtrasBefore++;
        }
        return fullMatch;
      });
      money.replace(/[\$,]/g,(fullMatch,offset)=>{
        if(offset<start){
          numExtrasAfter++;
        }
        return fullMatch;
      });
      let caratDiff = numExtrasAfter-numExtrasBefore;
      start += caratDiff;
      end += caratDiff;
      
      // Update value
      this.$().val(money);
      this.set('value',money);
      
      // Restore carat position
      this.$()[0].setSelectionRange(start,end);
      
      // Send onChange event
      if( this.attrs.onChange && typeof this.attrs.onChange === 'function'){
        this.attrs.onChange(value);
      }
    }
    
    
  },
  
  monetizeOnChange(val,start=null){
    
    let maxWait = 1000;
    let newVal = this.$().val();
    
    if(!start){
      start = Date.now();
    }
    
    if(newVal !== val){
      this.monetize();
    } else {
      if(Date.now() - start <= maxWait){
        Ember.run.next(()=>{
          this.monetizeOnChange(val,start);
        });
      }
    }
    
  },
  
});
