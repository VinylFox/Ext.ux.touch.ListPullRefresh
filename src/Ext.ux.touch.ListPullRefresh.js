Ext.apply(Ext.anims, {
    rotate: new Ext.Anim({
        autoClear: false,
        out: false,
        before: function(el) {
            var d = '';
            if (this.dir == 'ccw'){
              d = '-';
            }

            this.from = {
                '-webkit-transform': 'rotate('+d+''+this.fromAngle+'deg)'
            };

            this.to = {
                '-webkit-transform': 'rotate('+d+''+this.toAngle+'deg)'
            };
                        
        }
    })
});  

Ext.ns('Ext.ux.touch');
/**
 * @author Shea Frederick - http://www.vinylfox.com - Concept and Style/Images from enormego's EGOTableViewPullRefresh
 * @class Ext.ux.touch.ListPullRefresh
 * <p>A plugin that creates 'pull to refresh' functionality in List and DataView components.</p>
 * <p>Sample Usage</p>
 * <pre><code>
 {
     xtype: 'list',
     ...,
     plugins: [new Ext.ux.touch.ListPullRefresh({
       reloadFn: function(cb,scope){
         // do whatever needs to happen for reload
         // then call the cb function passed in
         // cb.call(this);
       }
     })],
     ...
 }
 * </code></pre>
 */
Ext.ux.touch.ListPullRefresh = Ext.extend(Ext.util.Observable, {
  constructor: function(config){
    Ext.apply(this,config);
    this.addEvents({
      'released': true
    });
    Ext.ux.touch.ListPullRefresh.superclass.constructor.call(this, config);
  },
  langPullRefresh: 'Pull down to refresh...',
  langReleaseRefresh: 'Release to refresh...',
  langLoading: 'Loading...',
  loading: false,
  // private
  init: function(cmp){
    this.cmp = cmp;
    this.lastUpdate = new Date();
    cmp.loadingText = undefined;
    cmp.on('render', this.initPullHandler, this);
  },
  // private
  initPullHandler: function(){
    this.pullTpl = new Ext.XTemplate(
      '<div class="pullrefresh" style="height: {h}; text-align: bottom;">'+
        '<div class="msgwrap" style="height: 75px; bottom: 0px; position: relative;">'+
          '<span class="arrow {s}"></span>'+
          '<span class="msg">{m}</span>'+
          '<span class="lastupdate">Last Updated: {[Ext.util.Format.date(values.l,"m/d/Y h:iA")]}</span>'+
        '</div>'+
      '</div>');
    this.pullEl = this.pullTpl.insertBefore(this.cmp.scroller.el, {h:0,m:this.langPullRefresh,l:this.lastUpdate}, true);
    this.pullEl.hide();
    Ext.Element.cssTranslate(this.pullEl, {x:0, y:-75});
    this.cmp.scroller.on('offsetchange', this.handlePull, this);
  },
  //private
  handlePull: function(scroller, offset){
    if (scroller.direction === 'vertical' && !this.loading){
      if (offset.y > 0){
        Ext.Element.cssTranslate(this.pullEl, {x:0, y:offset.y-75});
        if (offset.y > 75){
          // state 1
          if (this.state !== 1){
            this.prevState = this.state;
            this.state = 1;
            this.pullTpl.overwrite(this.pullEl, {h:offset.y,m:this.langReleaseRefresh,l:this.lastUpdate});
            Ext.Anim.run(this.pullEl.select('.arrow').first(),'rotate',{dir:'ccw',fromAngle:0,toAngle:180});
          }
        }else if (!scroller.isDragging()){
          // state 3
          if (this.state !== 3){
            this.prevState = this.state;
            this.state = 3;
            if (this.prevState == 1){
              this.loading = true;
              this.lastUpdate = new Date();
              this.pullEl.hide();
              this.fireEvent('released',this,this.cmp);
            }
          }
        }else{
          // state 2
          if (this.state !== 2){
            this.prevState = this.state;
            this.state = 2;
            this.pullTpl.overwrite(this.pullEl, {h:offset.y,m:this.langPullRefresh,l:this.lastUpdate});
            this.pullEl.show();
            if (this.prevState == 1){
              Ext.Anim.run(this.pullEl.select('.arrow').first(),'rotate',{dir:'cw',fromAngle:180,toAngle:0});
            }
          }
        }
      }
    }
  },
  //private
  processComplete: function(){
    this.loading = false;
    this.lastUpdate = new Date();
    this.pullTpl.overwrite(this.pullEl, {h:0,m:this.langPullRefresh,l:this.lastUpdate});
  }
});

Ext.preg('listpullrefresh', Ext.ux.touch.ListPullRefresh);