import Ember from 'ember';
import Showdown from 'ember-cli-showdown/components/markdown-to-html';

export default Showdown.extend({
  
  /**
   * Set to true to support the ability to splice components within the markdown
   * using tags like {{component_id}} in conjunction with an object containing information about each component id.
   * @type {Boolean}
   */
  blackoutMode: false,
  
  startTag: '<div class="jaydiz">',
  
  parts: Ember.computed('markdown',function(){
    
    this.setupOptions();
    
    // Parse markdown first
    let markdown = this.get('markdown') || '';
    let parsed = this.converter.makeHtml(markdown);
    
    let components = this.get('components');
    let content = parsed.replace(/\{\{(\w+?)\}\}/g,(fullMatch)=>{
      return `{{split}}${fullMatch}{{split}}`;
    });
    
    let parts = content.split('{{split}}');
    
    parts.forEach((val,i)=>{
      let isComponent;
      let key = val.replace(/\{\{(\w+?)\}\}/g,(fullMatch,key)=>{
        isComponent = true;
        return key;
      });
      
      if(isComponent && components.get(key)){
        parts[i] = {
          isComponent: true,
          component: components.get(key)
        };
      } else {
        parts[i] = {
          content: Ember.String.htmlSafe(val)
        };
      }
      
    });
    //print('parts',parts);
    return parts;
    
  }),
  
  setupOptions(){
    
    var showdownOptions = this.getProperties(
      'omitExtraWLInCodeBlocks',
      'noHeaderId',
      'prefixHeaderId',
      'parseImgDimensions',
      'headerLevelStart',
      'simplifiedAutoLink',
      'literalMidWordUnderscores',
      'strikethrough',
      'tables',
      'tablesHeaderId',
      'ghCodeBlocks',
      'tasklists',
      'smoothLivePreview'
    );

    for (var option in showdownOptions) {
      if (showdownOptions.hasOwnProperty(option)) {
        this.converter.setOption(option, showdownOptions[option]);
      }
    }
    
  }
  
  /**
   * This is what exists in ember-cli-showdown, for reference
   */
  
  /*html: Ember.computed('markdown', function() {
    var showdownOptions = this.getProperties(
      'omitExtraWLInCodeBlocks',
      'noHeaderId',
      'prefixHeaderId',
      'parseImgDimensions',
      'headerLevelStart',
      'simplifiedAutoLink',
      'literalMidWordUnderscores',
      'strikethrough',
      'tables',
      'tablesHeaderId',
      'ghCodeBlocks',
      'tasklists',
      'smoothLivePreview'
    );

    for (var option in showdownOptions) {
      if (showdownOptions.hasOwnProperty(option)) {
        this.converter.setOption(option, showdownOptions[option]);
      }
    }

    var source = this.get('markdown') || '';
    return Ember.String.htmlSafe(this.converter.makeHtml(source));
  })*/
  
});
