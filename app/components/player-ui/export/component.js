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
    downloadPlaintext(button){
      let fileName;
      if(this.get('player')){
        fileName = this.get('player.name').replace(' ','-')+'.txt';
      } else {
        fileName = this.get('squad.firstObject.club.name').replace(' ','-')+'.txt';
      }
      let text = this.generatePlaintext();
      this.saveFile(fileName,text,false,button);
    },
    copyPlaintext(button){
      let text = this.generatePlaintext();
      //print(text);
      this.copyToClipboard(text,button);
    },
    downloadCSV(button){
      let csv = this.generateCSV();
      //log('download CSV');
      let fileName;
      if(this.get('player')){
        fileName = this.get('player.name').replace(' ','-')+'.csv';
      } else {
        fileName = this.get('squad.firstObject.club.name').replace(' ','-')+'.csv';
      }
      this.saveFile(fileName,csv,true,button);
    },
    copyCSV(button){
      let csv = this.generateCSV();
      print(csv);
      this.copyToClipboard(csv,button);
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
  
  saveFile(filename,text,isCSV,button){
    
    let isFileSaverSupported;
    try {
      isFileSaverSupported = !!new window.Blob();
    } catch (e) {}
    
    if(window.browsers.safari||window.os.iOS){
      isFileSaverSupported = false;
    }
    
    if(isFileSaverSupported){
      
      button.succeed();
      
      let type;
      if(isCSV){
        type = "text/csv;charset=utf-8";
      } else {
        type = "text/plain;charset=utf-8";
      }
      
      var blob = new Blob([text], {type: type});
      window.saveAs(blob, filename);
      
    } else {
      
      let http = 'https://www.';
      let url = http+'blackoutrugby.com/file.php';
      
      // Post text to server
      Ember.$.post( url, { text: text } ).done((data)=>{
        
        // Get text as file from server
        window.location = http+'blackoutrugby.com/file.php?token=' + data + '&type=' + (isCSV?'csv':'text') + '&filename=' + filename;
        
        button.succeed();
        
      });
      
    }
    
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
    
    // ------------------------------ Jersey
    
    if(p.get('jersey')!==255){
      text += pipe;
      text += '#' + p.get('jersey');
    }
    text += nl;
    text += nl;
    
    // ------------------------------ CSR
    
    text += i18n.t('player.csr') + ' ' + number.compute(p.get('csr')) + (p.get('csrChange') ? ' (' + ((p.get('csrChange')>=0 ? '+' : '') + p.get('csrChange')) + ')' : '');
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
    
  },
  
  generateCSV(){
    
    let text = '';
    let i18n = this.get('i18n');
    let nl = "\n";
    let c = ',';
    
    // ------------------------------ Headers
    
    text += i18n.t('misc.name').toString();
    text += c;
    text += i18n.t('player.jersey').toString();
    text += c;
    text += i18n.t('player.csr').toString();
    text += c;
    text += i18n.t('player.csr-change').toString();
    text += c;
    text += i18n.t('player.age').toString();
    text += c;
    text += i18n.t('player.birthday').toString();
    text += c;
    text += i18n.t('player.height').toString();
    text += c;
    text += i18n.t('player.weight').toString();
    text += c;
    text += i18n.t('player.handed-(left/right)').toString().ucFirst();
    text += c;
    text += i18n.t('player.footed-(left/right)').toString().ucFirst();
    text += c;
    text += i18n.t('player.salary').toString();
    text += c;
    text += i18n.t('player.nationality').toString();
    text += c;
    text += i18n.t('player.dual-nationality').toString();
    text += c;
    text += i18n.t('player.form').toString();
    text += c;
    text += i18n.t('player.energy').toString();
    text += c;
    text += i18n.t('player.aggression').toString();
    text += c;
    text += i18n.t('player.leadership').toString();
    text += c;
    text += i18n.t('player.discipline').toString();
    text += c;
    text += i18n.t('player.experience').toString();
    text += c;
    text += i18n.t('player.stamina').toString();
    text += c;
    text += i18n.t('player.handling').toString();
    text += c;
    text += i18n.t('player.attack').toString();
    text += c;
    text += i18n.t('player.defence').toString();
    text += c;
    text += i18n.t('player.technique').toString();
    text += c;
    text += i18n.t('player.strength').toString();
    text += c;
    text += i18n.t('player.jumping').toString();
    text += c;
    text += i18n.t('player.speed').toString();
    text += c;
    text += i18n.t('player.agility').toString();
    text += c;
    text += i18n.t('player.kicking').toString();
    
    text += nl;
    
    if(this.get('player')){
      text += this.generatePlayerCSV(this.get('player'));
    } else if(this.get('squad')){
      this.get('squad').forEach((player,i)=>{
        text += this.generatePlayerCSV(player);
        if((i+1)<this.get('squad').length){
          text += "\n";
        }
      });
    }
    
    return text;
    
  },
  
  generatePlayerCSV(player){
    
    let text = '';
    let c = ',';
    let i18n = this.get('i18n');
    let p = player;
    
    // ------------------------------ Name
    
    text += p.get('name');
    
    // ------------------------------ Jersey
    
    text += c;
    text += p.get('jersey');
    
    // ------------------------------ CSR
    
    text += c;
    text += p.get('csr');
    
    if(p.get('csrChange')){
      text += c;
      text += p.get('csrChange');
    }
    
    // ------------------------------ Age
    
    text += c;
    text += p.get('age');
    
    // ------------------------------ Birthday
    
    text += c;
    text += i18n.t('player.birth-round-and-day-(short)', {round: p.get('birthRound'), day: p.get('birthDay')});
    
    // ------------------------------ Height
    
    text += c;
    text += p.get('height');
    
    // ------------------------------ Weight
    
    text += c;
    text += p.get('weight');
    
    // ------------------------------ Handed
    
    text += c;
    text += p.get('handed');
    
    // ------------------------------ Footed
    
    text += c;
    text += p.get('footed');
    
    // ------------------------------ Salary
    
    text += c;
    text += '$' + p.get('salary');
    
    // ------------------------------ Nationality
    
    text += c;
    text += p.get('nationality.name');
    text += c;
    text += p.get('dualNationality') ? p.get('dualNationality.name') : '';
    
    // ------------------------------ Form
    
    text += c;
    text += p.get('form') + '%';
    
    // ------------------------------ Energy
    
    text += c;
    text += p.get('energy') + '%';
    
    // ------------------------------ Traits
    
    text += c;
    text += p.get('aggression');
    text += c;
    text += p.get('leadership');
    text += c;
    text += p.get('discipline');
    text += c;
    text += p.get('experience');
    
    // ------------------------------ Skills
    
    text += c;
    text += p.get('stamina');
    text += c;
    text += p.get('handling');
    text += c;
    text += p.get('attack');
    text += c;
    text += p.get('defence');
    text += c;
    text += p.get('technique');
    text += c;
    text += p.get('strength');
    text += c;
    text += p.get('jumping');
    text += c;
    text += p.get('speed');
    text += c;
    text += p.get('agility');
    text += c;
    text += p.get('kicking');
    
    return text;
    
  },
  
});
