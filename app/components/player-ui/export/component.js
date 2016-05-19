import Ember from 'ember';
import number from 'rugby-ember/helpers/number';
import formatMoney from 'rugby-ember/utils/money';
import t from "rugby-ember/utils/translation-macro";

function select(element) {
    var selectedText;

    if (element.nodeName === 'INPUT' || element.nodeName === 'TEXTAREA') {
        element.focus();
        element.setSelectionRange(0, element.value.length);

        selectedText = element.value;
    }
    else {
        if (element.hasAttribute('contenteditable')) {
            element.focus();
        }

        var selection = window.getSelection();
        var range = document.createRange();

        range.selectNodeContents(element);
        selection.removeAllRanges();
        selection.addRange(range);

        selectedText = selection.toString();
    }

    return selectedText;
}

export default Ember.Component.extend({
  
  showingClipboardBox: false,
  
  actions: {
    downloadPlaintext(){
      //log('download plain');
      let text = this.generatePlaintext();
      this.saveFile(this.get('player.name').replace(' ','-')+'.txt',text);
    },
    copyPlaintext(button){
      let text = this.generatePlaintext();
      //print(text);
      this.copyToClipboard(text,button);
    },
    downloadCSV(){
      //log('download CSV');
    },
    copyCSV(){
      //log('copy CSV');
    },
    showClipboardBox(button,text){
      if(!this.get('clipboardBoxForm')){
        this.set('clipboardBoxForm',[
          {
            id: 'clipboardText',
            type: 'textarea',
            value: text,
            //readonly: true,
            helper: window.os.touchOS ? null : t('misc.clipboard-failure.helper'),
            maxHeight: Math.max(150,Ember.$(window).height() - 440),
          },
        ]);
      }
      
      // Render float window with ember
      this.set('clipboardNotSupported',true);
      
      Ember.run.next(()=>{
        this.set('showingClipboardBox',true);
        
        /**
         * iOS has a feature which prevents keyboard display
         * if the user has not tapped the input element
         * http://stackoverflow.com/questions/30752250/ios-workaround-for-manually-focusing-on-an-input-textarea
         */
        Ember.run.next(()=>{
          
          if(!window.os.iOS){
            
            //Ember.$('#clipboardText').focus();
            select(Ember.$('#clipboardText')[0]);
            
          } else {
            
            Ember.$('#clipboardText').focus(()=>{
              
              Ember.run.next(()=>{
                select(Ember.$('#clipboardText')[0]);
              });
              
            });
            
          }
          
        });
        
      });
      
      this.set('clipboardButton',button);
      
    },
    hideClipboardBox(){
      this.get('clipboardButton').reset();
      this.set('showingClipboardBox',false);
    },
    onHideClipboardBox(){
      this.send('hideClipboardBox');
    },
  },
  
  copyToClipboard(text,button){
    
    let clipboard = new Clipboard('.copy-button', {
      text: function() {
        return text;
      }
    });
    
    clipboard.on('success', (e)=>{
      button.succeed();
      e.clearSelection();
    });

    clipboard.on('error', ()=>{
      this.send('showClipboardBox',button,text);
    });
    
    this.$('.copy-button').click();
    
    clipboard.destroy();
    
  },
  
  saveFile(filename,text){
    
    var element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', filename);

    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
    
  },
  
  generatePlaintext(){
    
    let text = '';
    
    if(this.get('player')){
      text += this.generatePlayer(this.get('player'));
    } else if(this.get('squad')){
      this.get('squad').forEach((player,i)=>{
        text += this.generatePlayer(player);
        if((i+1)<this.get('squad').length){
          text += "\n\n";
          text += "---------------------------------";
          text += "\n\n";
        }
      });
    }
    
    return text;
    
  },
  
  generatePlayer(player){
    
    let text = '';
    let nl = "\n";
    let i18n = this.get('i18n');
    let p = player;
    let pipe = '  |  ';
    
    let pad = (str,len)=>{
      
      let extra = len - String(str).length;
      
      for(let i=0; i<extra; i++){
        str += ' ';
      }
      return str;
      
    };
    
    let getLongest = (strs)=>{
      
      let longest = 0;
      strs.forEach(str=>{
        if(str.length>longest){
          longest = str.length;
        }
      });
      return longest;
      
    };
    
    // ------------------------------ Name
    
    text += p.get('name');
    text += nl;
    text += nl;
    
    // ------------------------------ CSR
    
    text += i18n.t('player.csr') + ' ' + number.compute(p.get('csr')) + (p.get('csrChange') ? ' (' + ((p.get('csrChange')>=0 ? '+' : '-') + p.get('csrChange')) + ')' : '');
    text += nl;
    
    // ------------------------------ Age / Birthday
    
    text += i18n.t('player.age') + ' ' + p.get('age');
    text += nl;
    text += i18n.t('player.birthday') + ' ' + i18n.t('player.birth-round-and-day', {round: p.get('birthRound'), day: p.get('birthDay')});
    text += nl;
    text += nl;
    
    // ------------------------------ Height
    
    text += p.get('height') + i18n.t('player.centimeters-(short)');
    text += pipe;
    
    // ------------------------------ Weight
    
    text += p.get('weight') + i18n.t('player.kilograms-(short)');
    text += nl;
    
    // ------------------------------ Handed, Footed
    
    text += p.get('handed') + ' ' + i18n.t('player.handed-(left/right)');
    text += pipe;
    text += p.get('footed') + ' ' + i18n.t('player.footed-(left/right)');
    text += nl;
    
    // ------------------------------ Salary / Wages
    
    text += i18n.t('player.salary') + ' ';
    text += formatMoney(p.get('salary'),this.get('locale.currentLocale'));
    text += ' (' + formatMoney(p.get('wage'),this.get('locale.currentLocale')) + ' ' + i18n.t('player.per-week-(wages)') + ')';
    text += nl;
    
    // ------------------------------ Nationality
    
    //text += i18n.t('player.nationality') + ' ';
    text += p.get('nationality.name');
    
    // ------------------------------ Dual Nationality
    
    let val = p.get('dualNationality.name');
    if(val){
      text += pipe;
      text += val;
    }
    text += nl;
    text += nl;
    
    // ------------------------------ Form, Energy
    
    text += p.get('form') + '% ' + i18n.t('player.form');
    text += pipe;
    text += p.get('energy') + '% ' + i18n.t('player.energy');
    text += nl;
    text += nl;
    
    // ------------------------------ Traits
    
    let agg = i18n.t('player.aggression').toString();
    let lea = i18n.t('player.leadership').toString();
    let dis = i18n.t('player.discipline').toString();
    let exp = i18n.t('player.experience').toString();
    let longest = getLongest([agg,lea,dis,exp]);
    let padding = longest + 2;
    
    text += pad(p.get('aggression'),3) + pad(agg,padding);
    text += pad(p.get('leadership'),3) + lea;
    text += nl;
    text += pad(p.get('discipline'),3) + pad(dis,padding);
    text += pad(p.get('experience'),3) + exp;
    text += nl;
    text += nl;
    
    // ------------------------------ Skills
    
    let sta = i18n.t('player.stamina').toString();
    let han = i18n.t('player.handling').toString();
    let att = i18n.t('player.attack').toString();
    let def = i18n.t('player.defence').toString();
    let tec = i18n.t('player.technique').toString();
    let str = i18n.t('player.strength').toString();
    let jum = i18n.t('player.jumping').toString();
    let spe = i18n.t('player.speed').toString();
    let agi = i18n.t('player.agility').toString();
    let kic = i18n.t('player.kicking').toString();
    longest = getLongest([sta,han,att,def,tec,str,jum,spe,agi,kic]);
    padding = longest + 2;
    
    text += pad(p.get('stamina'),3) + pad(sta,padding);
    text += pad(p.get('handling'),3) + han;
    text += nl;
    text += pad(p.get('attack'),3) + pad(att,padding);
    text += pad(p.get('defence'),3) + def;
    text += nl;
    text += pad(p.get('technique'),3) + pad(tec,padding);
    text += pad(p.get('strength'),3) + str;
    text += nl;
    text += pad(p.get('jumping'),3) + pad(jum,padding);
    text += pad(p.get('speed'),3) + spe;
    text += nl;
    text += pad(p.get('agility'),3) + pad(agi,padding);
    text += pad(p.get('kicking'),3) + kic;
    
    
    return text;
    
  }
  
});
