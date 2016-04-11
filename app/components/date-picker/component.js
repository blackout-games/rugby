import Ember from 'ember';

export default Ember.Component.extend({
  
  setup: Ember.on('didInsertElement',function(){
    
    let isClicking = false;
    let isTouch = null;
    let isInitting = true;
    
    /**
     * Can't react on down on touch devices, since then we can't scroll the calendar on touch.
     */
    let allowClickOnTouchStart = false;
    
    let runOnMousedown = ()=>{
      
      
      this.$('.date-picker .datepicker--cell').on('mousedown touchstart',(e)=>{
        if(!isClicking && (allowClickOnTouchStart || e.type!=='touchstart')){
          this.$(e.target).click();
          isClicking = true;
        }
        if(isTouch===null){
          isTouch = e.type==='touchstart';
        }
      });
      
      if(isClicking && (allowClickOnTouchStart || !isTouch)){
        this.$('.date-picker .datepicker--cell').on('mouseup touchend',(e)=>{
          isClicking = false;
          if(isTouch){
            this.$(e.target).addClass('-disabled-');
            Ember.run.next(()=>{
              this.$(e.target).removeClass('-disabled-');
            });
          }
        });
      }
      
      /*this.$('.date-picker .datepicker--nav-action, .date-picker .datepicker--nav-title').on('mousedown touchstart',(e)=>{
        if(e.type!=='touchstart'){
          this.$(e.target).click();
        }
        if(isTouch===null){
          isTouch = e.type==='touchstart';
        }
      });*/
      
      this.$('input').prop('disabled',true);
      
      if(this.$('.datepicker--nav-action i').length === 0){
        
        this.$('.datepicker--nav-action svg').hide();
        this.$('.datepicker--nav-action svg').eq(0).after('<i class="icon-left-big"></i>');
        this.$('.datepicker--nav-action svg').eq(1).after('<i class="icon-right-big"></i>');
        
      }
      
    };
    
    let startDate = this.assertDate(this.get('date'));
    let minDate = this.assertDate(this.get('minDate'));
    let maxDate = this.assertDate(this.get('maxDate'));
    
    let datePicker = this.$('input').datepicker({
      minDate: minDate,
      maxDate: maxDate,
      classes: 'date-picker no-webkit-highlight',
      language: this.get('language'),
      inline: true,
      toggleSelected: false,
      onSelect: (formattedDate, date)=>{
        if(this.attrs.onChange && !isInitting){
          this.attrs.onChange(date,formattedDate);
        }
      },
      onRenderCell: ()=>{
        Ember.run.once(runOnMousedown);
      },
    }).data('datepicker');
    
    if(startDate){
      datePicker.selectDate(startDate);
    }
    
    this.$('input').addClass('hidden-but-accessible');
    this.$('.date-picker').attr('aria-hidden','true');
    
    // Save picker
    this.set('datePicker',datePicker);
    
    isInitting = false;
    
  }),
  
  updateLanguage: Ember.on('didUpdateAttrs',function(opts){
    if( this.attrChanged(opts,'currentLocale') ){
      
      this.get('datePicker').update('language',this.get('language'));
      
    }
  }),
  
  language: Ember.computed('currentLocale',function(){
    
    return {
      days: moment.weekdays(),
      daysShort: moment.weekdaysShort(),
      daysMin: moment.weekdaysMin(),
      months: moment.months(),
      monthsShort: moment.monthsShort(),
      today: this.get('i18n').t('date.today'),
      clear: this.get('i18n').t('buttons.clear-(reset)'),
      dateFormat: 'dd/mm/yy',
      firstDay: 0
    };
    
  }),
  
  assertDate(date){
    
    if(!date){
      return date;
    } else if(typeof(date) === 'object'){
      return date;
    } else {
      return new Date(date);
    }
    
  },
  
});
