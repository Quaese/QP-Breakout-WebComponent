var L=i=>({funBreakoutStart:{de:"Start",en:"Start"},funBreakoutStop:{de:"Stop",en:"Stop"},funBreakoutPause:{de:"Pause",en:"Pause"},funBreakoutGameOver:{de:"Game Over",en:"Game Over"},scoreboardSize:{de:`Spalten: ${i[0]}, Reihen: ${i[1]}`,en:`Cols: ${i[0]}, Rows: ${i[1]}`},scoreboardScore:{de:`Punkte: ${i[0]}`,en:`Score: ${i[0]}`},scoreboardSpeed:{de:`Speed: ${i[0]}`,en:`Speed: ${i[0]}`},scoreboardLevel:{de:`Level: ${i[0]}`,en:`Level: ${i[0]}`},scoreboardLives:{de:`Leben: ${i[0]}`,en:`Lives: ${i[0]}`},scoreboardRemainingBricks:{de:`Bricks: ${i[0]}`,en:`Bricks: ${i[0]}`},screenInitTitle:{de:"QP Breakout",en:"QP Breakout"},screenInitText:{de:"Start dr\xFCcken oder Leertaste",en:"Press start or space to play"},screenWaitingTitle:{de:"Breakout",en:"Breakout"},screenWaitingText:{de:"Pfeiltasten links und rechts zum Bewegen",en:"Use Arrow keys left and right to move"},screenWaitingAction:{de:"Leertaste zum Starten",en:"Press space to start"},screenPausedTitle:{de:"Pausiert",en:"Paused"},screenPausedText:{de:"Leertaste zum Fortsetzen",en:"Press space to resume"},screenLevel:{de:`Level: ${i[0]}`,en:`Level: ${i[0]}`},screenCompleteTitle:{de:"Level geschafft",en:"Level Complete"},screenCompleteScore:{de:`Punkte: ${i[0]}`,en:`Score: ${i[0]}`},screenCompleteText:{de:"Leertaste zum Weiterspielen",en:"Press space to continue"},screenGameoverTitle:{de:"Game Over",en:"Game Over"},screenGameoverText:{de:"Start oder Leertaste dr\xFCcken zum Neustarten",en:"Press start or space to restart"},screenRemainingLives:{de:`Leben: ${i[0]}`,en:`Lives: ${i[0]}`},scoreboardState_init:{de:"QP Breakout",en:"QP Breakout"},scoreboardState_waiting:{de:"Bereit",en:"Ready"},scoreboardState_complete:{de:"Level geschafft",en:"Level Complete"},scoreboardState_paused:{de:"Pausiert",en:"Paused"},scoreboardState_running:{de:"Running",en:"Running"},scoreboardState_stopped:{de:"Stop",en:"Stopped"}}),x=["de","en"],y=L;function P(){return`
      <style> :host {
          display: block;
          color: inherit;
          font-family: inherit;
        }
      
        .qp-scoreboard {
          display: grid;
          grid-template-columns: 25% 25% 50%;
          border-bottom: 1px solid #ddd;
          margin: 0 2rem;
          padding: 0.25rem 1rem;
          font-family: monospace;
          font-size: 0.9rem;
          white-space: nowrap;
          overflow: hidden;
        }
      
        .qp-scoreboard-output {
          text-align: center;
        }
      
        .qp-scoreboard-counter {
          text-align: right;
        }
      
        .qp-scoreboard-state {
          text-align: left;
        }
      
        .qp-breakout-wrapper {
          position: relative;
          display: flex;
          justify-content: center;
          width: 100%;
          padding: 2rem 0;
        }
          
        .qp-breakout-screen {
          position: absolute;
          z-index: 5;
          display: flex;
          justify-content: center;
          align-items: center;
          font-family: monospace;
          font-size: 1.5rem;
          color: #fff;
          text-align: center;
          opacity: 0;
        }
      
        .qp-breakout-screen-init {
          position: relative;
        }
        .qp-breakout-screen-init::before {
          content: "";
          position: absolute;
          z-index: -1;
          inset: 0;
          background-image: var(--bg-image);
          background-repeat: no-repeat;
          background-position: 50%;
          background-size: 50%;
          opacity: 0.75;
        }
      
        .qp-breakout-screen-visible {
          opacity: 1;
        }
      
        .qp-breakout-screen,
        canvas {
          border-radius: 10px;
        }
      
        canvas {
          position: absolute;
          border-radius: 4px;
        }
      
        .qp-breakout-bg-canvas {
          z-index: 1;
          background-color: #0a0a2a;
        }
      
        .qp-breakout-logo-canvas {
          z-index: 2;
        }
      
        .qp-breakout-bricks-canvas {
          z-index: 3;
        }
      
        .qp-breakout-canvas {
          z-index: 4;
          border: 1px solid #ddd;
        }
      
        /* Prevent Events */
        .qp-prevent-events {
          pointer-events: none;
        }
      
        /* Button Bar and Buttons */
        .qp-breakout-button-bar {
          display: flex;
          justify-content: center;
          gap: 1rem;

          border-top: 1px solid #ddd;
          margin: 0 2rem 1rem;
          padding: 1rem 1rem 0.5rem;
          overflow: hidden;
        }
      
        .qp-btn {
          width: 100%;
          padding: 0.875rem;
          border: none;
          border-radius: 8px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
        }
      
        .qp-btn:disabled {
          cursor: default;
        }
      
        .qp-btn:hover:not(:disabled) {
          transform: translateY(-2px);
        }
      
        .qp-btn.qp-btn-small {
          width: 30px;
          text-align: center;
          padding: 0.5rem 0;
        }
      
        .qp-btn.qp-btn-full {
          display: block;
          text-align: center;
        }
      
        .qp-btn-primary {
          --qp-btn-color: rgba(255, 255, 255, 1);
          --qp-btn-bg: rgba(13, 110, 253, 1);
          --qp-btn-border-color: rgba(13, 110, 253, 1);
          --qp-btn-hover-color: rgba(255, 255, 255, 1);
          --qp-btn-hover-bg: rgba(11, 94, 215, 1);
          --qp-btn-hover-border-color: rgba(10, 88, 202, 1);
          --qp-btn-disabled-color: rgba(255, 255, 255, 0.65);
          --qp-btn-disabled-bg: rgba(13, 110, 253, 0.65);
          --qp-btn-disabled-border-color: rgba(13, 110, 253, 0.65);
        }
      
        .qp-btn-primary {
          color: var(--qp-btn-color);
          background-color: var(--qp-btn-bg);
          border-color: var(--qp-btn-border-color);
        }
      
        .qp-btn-primary:hover {
          color: var(--qp-btn-hover-color);
          background-color: var(--qp-btn-hover-bg);
          border-color: var(--qp-btn-hover-border-color);
        }
      
        .qp-btn-primary:disabled {
          color: var(--qp-btn-disabled-color);
          background-color: var(--qp-btn-disabled-bg);
          border-color: var(--qp-btn-disabled-border-color);
        }
      
        .qp-btn-secondary {
          --qp-btn-color: rgba(255, 255, 255, 1);
          --qp-btn-bg: rgba(108, 117, 125, 1);
          --qp-btn-border-color: rgba(108, 117, 125, 1);
          --qp-btn-hover-color: rgba(255, 255, 255, 1);
          --qp-btn-hover-bg: rgba(92, 99, 106, 1);
          --qp-btn-hover-border-color: rgba(86, 94, 100, 1);
          --qp-btn-disabled-color: rgba(255, 255, 255, 0.65);
          --qp-btn-disabled-bg: rgba(108, 117, 125, 0.65);
          --qp-btn-disabled-border-color: rgba(108, 117, 125, 0.65);
        }
      
        .qp-btn-secondary {
          color: var(--qp-btn-color);
          background-color: var(--qp-btn-bg);
          border-color: var(--qp-btn-border-color);
        }
      
        .qp-btn-secondary:hover {
          color: var(--qp-btn-hover-color);
          background-color: var(--qp-btn-hover-bg);
          border-color: var(--qp-btn-hover-border-color);
        }
      
        .qp-btn-secondary:disabled {
          color: var(--qp-btn-disabled-color);
          background-color: var(--qp-btn-disabled-bg);
          border-color: var(--qp-btn-disabled-border-color);
        }
      
        .qp-btn-cta,
        .qp-btn-success {
          --qp-btn-color: rgba(255, 255, 255, 1);
          --qp-btn-bg: rgba(25, 135, 84, 1);
          --qp-btn-border-color: rgba(25, 135, 84, 1);
          --qp-btn-hover-color: rgba(255, 255, 255, 1);
          --qp-btn-hover-bg: rgba(21, 115, 71, 1);
          --qp-btn-hover-border-color: rgba(20, 108, 67, 1);
          --qp-btn-disabled-color: rgba(255, 255, 255, 0.65);
          --qp-btn-disabled-bg: rgba(25, 135, 84, 0.65);
          --qp-btn-disabled-border-color: rgba(25, 135, 84, 0.65);
        }
      
        .qp-btn-cta {
          color: var(--qp-btn-color);
          background-color: var(--qp-btn-bg);
          border-color: var(--qp-btn-border-color);
        }
      
        .qp-btn-cta:hover {
          color: var(--qp-btn-hover-color);
          background-color: var(--qp-btn-hover-bg);
          border-color: var(--qp-btn-hover-border-color);
        }
      
        .qp-btn-cta:disabled {
          color: var(--qp-btn-disabled-color);
          background-color: var(--qp-btn-disabled-bg);
          border-color: var(--qp-btn-disabled-border-color);
        }
      
        .qp-btn-success {
          color: var(--qp-btn-color);
          background-color: var(--qp-btn-bg);
          border-color: var(--qp-btn-border-color);
        }
      
        .qp-btn-success:hover {
          color: var(--qp-btn-hover-color);
          background-color: var(--qp-btn-hover-bg);
          border-color: var(--qp-btn-hover-border-color);
        }
      
        .qp-btn-success:disabled {
          color: var(--qp-btn-disabled-color);
          background-color: var(--qp-btn-disabled-bg);
          border-color: var(--qp-btn-disabled-border-color);
        }
      
        .qp-btn-danger {
          --qp-btn-color: rgba(255, 255, 255, 1);
          --qp-btn-bg: rgba(220, 53, 69, 1);
          --qp-btn-border-color: rgba(220, 53, 69, 1);
          --qp-btn-hover-color: rgba(255, 255, 255, 1);
          --qp-btn-hover-bg: rgba(187, 45, 59, 1);
          --qp-btn-hover-border-color: rgba(176, 42, 55, 1);
          --qp-btn-disabled-color: rgba(255, 255, 255, 0.65);
          --qp-btn-disabled-bg: rgba(220, 53, 69, 0.65);
          --qp-btn-disabled-border-color: rgba(220, 53, 69, 0.65);
        }
      
        .qp-btn-danger {
          color: var(--qp-btn-color);
          background-color: var(--qp-btn-bg);
          border-color: var(--qp-btn-border-color);
        }
      
        .qp-btn-danger:hover {
          color: var(--qp-btn-hover-color);
          background-color: var(--qp-btn-hover-bg);
          border-color: var(--qp-btn-hover-border-color);
        }
      
        .qp-btn-danger:disabled {
          color: var(--qp-btn-disabled-color);
          background-color: var(--qp-btn-disabled-bg);
          border-color: var(--qp-btn-disabled-border-color);
        }
      
        .qp-btn-info {
          --qp-btn-color: rgba(0, 0, 0, 1);
          --qp-btn-bg: rgba(255, 193, 7, 1);
          --qp-btn-border-color: rgba(255, 193, 7, 1);
          --qp-btn-hover-color: rgba(0, 0, 0, 1);
          --qp-btn-hover-bg: rgba(255, 202, 44, 1);
          --qp-btn-hover-border-color: rgba(255, 199, 32, 1);
          --qp-btn-disabled-color: rgba(0, 0, 0, 0.65);
          --qp-btn-disabled-bg: rgba(255, 193, 7, 0.65);
          --qp-btn-disabled-border-color: rgba(255, 193, 7, 0.65);
        }
      
        .qp-btn-info {
          color: var(--qp-btn-color);
          background-color: var(--qp-btn-bg);
          border-color: var(--qp-btn-border-color);
        }
      
        .qp-btn-info:hover {
          color: var(--qp-btn-hover-color);
          background-color: var(--qp-btn-hover-bg);
          border-color: var(--qp-btn-hover-border-color);
        }
      
        .qp-btn-info:disabled {
          color: var(--qp-btn-disabled-color);
          background-color: var(--qp-btn-disabled-bg);
          border-color: var(--qp-btn-disabled-border-color);
        }
      
        </style>
    `}var w=P;var b=class i{static HEIGHT_RATIO=.9;static MIN_WIDTH=480;static _observer=null;static _instances=new Set;static _initObserver(){i._observer||(i._observer=new ResizeObserver(()=>{i._instances.forEach(e=>e.resize())}),i._observer.observe(document.documentElement))}static _destroyObserver(){i._instances.size>0||(i._observer?.disconnect(),i._observer=null)}constructor(e){e=Object.assign({wrapper:null,width:null,scale:.75,aspectRatio:1,cssClass:"qp-breakout-canvas",onResize:null},e),this._wrapper=e.wrapper,this._onResize=e.onResize,this._fixedWidth=e.width,this._scale=e.scale,this._aspectRatio=e.aspectRatio,this._cssClass=e.cssClass,this._dpr=window.devicePixelRatio||1,this.el=null,this.ctx=null,this.width=0,this.height=0,this.valid=!!this._wrapper}create(){this.valid&&(this.el=document.createElement("canvas"),this.el.classList.add(this._cssClass),this._wrapper.appendChild(this.el),this.ctx=this.el.getContext("2d"),this.resize())}resize(){if(!this.valid||!this.el)return;let e=this._wrapper.offsetWidth,t;this._fixedWidth?t=Math.min(this._fixedWidth,e):t=e*this._scale,t=Math.max(t,i.MIN_WIDTH);let s=window.innerHeight*i.HEIGHT_RATIO;t*this._aspectRatio>s&&(t=s/this._aspectRatio);let r=t*this._aspectRatio;t===this.width&&r===this.height||(this.width=t,this.height=r,this.el.style.width=this.width+"px",this.el.style.height=this.height+"px",this._wrapper.style.height=this.height+"px",this.el.width=this.width*this._dpr,this.el.height=this.height*this._dpr,this.ctx.setTransform(this._dpr,0,0,this._dpr,0,0),this._onResize&&typeof this._onResize=="function"&&this._onResize())}clear(){this.ctx.clearRect(0,0,this.width,this.height)}observe(){i._instances.add(this),i._initObserver(),this._wrapper&&i._observer.observe(this._wrapper)}disconnect(){i._instances.delete(this),i._destroyObserver()}destroy(){this.disconnect(),this.el?.remove(),this.el=null,this.ctx=null}};var _=class{constructor(e){e=Object.assign({canvasWidth:480,canvasHeight:320,paddleWidth:80,paddleHeight:10,speed:6,ctx:null,image:null},e),this.ctx=e.ctx,this.canvasWidth=e.canvasWidth,this.canvasHeight=e.canvasHeight,this.width=e.paddleWidth,this.height=e.paddleHeight,this.x=e.canvasWidth/2-this.width/2,this.y=e.canvasHeight-40,this.image=e.image,this.speed=e.speed,this.dx=0}move(){this.x+=this.dx,this.x<0&&(this.x=0),this.x+this.width>this.canvasWidth&&(this.x=this.canvasWidth-this.width)}centerOn(e){this.x=e/2-this.width/2,this.dx=0}setSpeed(e="right",t){let s=e==="right"?1:-1;this.dx=s*(t!==void 0?t:this.speed)}draw(){this.image?this.ctx.drawImage(this.image,this.x,this.y,this.width,this.height):(this.ctx.fillStyle="#e0e0e0",this.ctx.fillRect(this.x,this.y,this.width,this.height))}};var u=class{constructor(e){e=Object.assign({canvasWidth:480,canvasHeight:320,ballRadius:8,speedX:3,speedY:-3,ctx:null,fill:"#ffb347",image:null},e),this.ctx=e.ctx,this.canvasWidth=e.canvasWidth,this.canvasHeight=e.canvasHeight,this.radius=e.ballRadius,this.speedX=e.speedX,this.speedY=e.speedY,this.fill=e.fill,this.image=e.image,this.attached=!1,this.reset()}reset(){this.x=this.canvasWidth/2,this.y=this.canvasHeight/2,this.dx=this.speedX,this.dy=this.speedY,this.attached=!1}attachTo(e){this.attached=!0,this.x=e.x+e.width/2,this.y=e.y-this.radius,this.dx=0,this.dy=0}launch(){this.attached&&(this.attached=!1,this.dx=this.speedX,this.dy=this.speedY)}move(){this.x+=this.dx,this.y+=this.dy,this.dx<0&&this.x-this.radius<0&&(this.dx*=-1),this.dx>0&&this.x+this.radius>this.canvasWidth&&(this.dx*=-1),this.dy<0&&this.y-this.radius<0&&(this.dy*=-1)}pos(){return{x:this.x,y:this.y}}draw(){if(this.image){let e=this.radius*2;this.ctx.drawImage(this.image,this.x-this.radius,this.y-this.radius,e,e)}else this.ctx.beginPath(),this.ctx.arc(this.x,this.y,this.radius,0,Math.PI*2),this.ctx.fillStyle=this.fill,this.ctx.fill(),this.ctx.closePath()}};var v=class{constructor(e){e=Object.assign({width:50,height:8,x:0,y:0,fill:"orange",score:10,hits:1,ctx:null,image:null},e),this.ctx=e.ctx,this.x=e.x,this.y=e.y,this.width=e.width,this.height=e.height,this.fill=e.fill,this.score=e.score,this.image=e.image,this.hits=e.hits,this.maxHits=e.hits,this.visible=!0}hit(){return this.visible?(this.hits--,this.hits<=0?(this.visible=!1,!0):!1):!1}draw(){if(this.visible)if(this.image){if(this.maxHits>1){let e=this.hits/this.maxHits;this.ctx.globalAlpha=.4+.5*e}this.ctx.drawImage(this.image,this.x,this.y,this.width,this.height),this.maxHits>1&&(this.ctx.globalAlpha=1)}else{if(this.maxHits>1){let t=.4+.5*(this.hits/this.maxHits);this.ctx.fillStyle=this.fill.replace(/[\d.]+\)$/,`${t})`)}else this.ctx.fillStyle=this.fill;this.ctx.fillRect(this.x,this.y,this.width,this.height)}}};var k={0:null,1:{color:"rgba(255, 193, 7, 0.9)",score:10,hits:1,image:"brick-yellow"},2:{color:"rgba(255, 153, 0, 0.9)",score:15,hits:1,image:"brick-orange"},3:{color:"rgba(220, 53, 69, 0.9)",score:20,hits:1,image:"brick-red"},4:{color:"rgba(25, 135, 84, 0.9)",score:25,hits:1,image:"brick-green"},5:{color:"rgba(13, 110, 253, 0.9)",score:30,hits:1,image:"brick-blue"},6:{color:"rgba(102, 16, 242, 0.9)",score:50,hits:1,image:"brick-purple"},7:{color:"rgba(108, 117, 125, 0.9)",score:40,hits:2,image:"brick-slate"},8:{color:"rgba(255, 215, 0, 0.9)",score:75,hits:3,image:"brick-lime"}},C=[{name:"Classic",score:100,layout:[[6,6,6,6,6,6,6,6],[5,5,5,5,5,5,5,5],[4,4,4,4,4,4,4,4],[3,3,3,3,3,3,3,3]]},{name:"Checkerboard",score:150,layout:[[5,0,5,0,5,0,5,0],[0,4,0,4,0,4,0,4],[3,0,3,0,3,0,3,0],[0,2,0,2,0,2,0,2],[1,0,1,0,1,0,1,0]]},{name:"Diamond",score:200,layout:[[0,0,0,6,6,0,0,0],[0,0,5,5,5,5,0,0],[0,4,4,4,4,4,4,0],[3,3,3,3,3,3,3,3],[0,2,2,2,2,2,2,0],[0,0,1,1,1,1,0,0],[0,0,0,1,1,0,0,0]]},{name:"Fortress",score:250,layout:[[7,7,7,8,8,7,7,7],[6,0,0,0,0,0,0,6],[5,0,7,0,0,7,0,5],[4,0,0,0,0,0,0,4],[3,3,3,3,3,3,3,3]]},{name:"Stripes",score:300,layout:[[6,6,6,6,6,6,6,6],[0,0,0,0,0,0,0,0],[4,4,4,4,4,4,4,4],[0,0,0,0,0,0,0,0],[2,2,2,2,2,2,2,2]]},{name:"Random",score:500,random:{rows:5,cols:8,fillRatio:.6,maxType:6}}];var g=class{constructor(e){e=Object.assign({count:150,canvasWidth:480,canvasHeight:480,ctx:null},e),this.ctx=e.ctx,this.canvasWidth=e.canvasWidth,this.canvasHeight=e.canvasHeight,this.count=e.count,this.stars=[]}generate(){this.stars=[];for(let e=0;e<this.count;e++)this.stars.push({x:Math.random()*this.canvasWidth,y:Math.random()*this.canvasHeight,size:Math.random()*2+.5,alpha:Math.random()*.8+.2})}draw(){for(let e of this.stars)this.ctx.beginPath(),this.ctx.arc(e.x,e.y,e.size,0,Math.PI*2),this.ctx.fillStyle=`rgba(255, 255, 255, ${e.alpha})`,this.ctx.fill(),this.ctx.closePath()}};var R=[{state:"init",cssClasses:["qp-breakout-screen","qp-breakout-screen-init"],styleProps:i=>({"--bg-image":`url("${i}")`}),template:(i,e)=>`
      <div class="qp-breakout-screen-content">
        <h1>${i("screenInitTitle",e)}</h1>
        <p>${i("screenInitText",e)}</p>
      </div>`,dynamicFields:[]},{state:"waiting",cssClasses:["qp-breakout-screen"],template:(i,e,t)=>`
      <div class="qp-breakout-screen-content">
        <h1>${i("screenInitTitle",e)}</h1>
        <p>${i("screenWaitingText",e)}</p>
        <p class="qp-breakout-screen-lives">${i("screenRemainingLives",e,t.lives)}</p>
        <p>${i("screenWaitingAction",e)}</p>
      </div>`,dynamicFields:[{selector:".qp-breakout-screen-lives",dictKey:"screenRemainingLives",dataKey:"lives"}]},{state:"paused",cssClasses:["qp-breakout-screen"],template:(i,e)=>`
      <div class="qp-breakout-screen-content">
        <h1>${i("screenPausedTitle",e)}</h1>
        <p>${i("screenPausedText",e)}</p>
      </div>`,dynamicFields:[]},{state:"complete",cssClasses:["qp-breakout-screen"],template:(i,e,t)=>`
      <div class="qp-breakout-screen-content">
        <h1>${i("screenCompleteTitle",e)}</h1>
        <p class="qp-breakout-screen-level">${i("screenLevel",e,t.level)}</p>
        <p class="qp-breakout-screen-lives">${i("screenRemainingLives",e,t.lives)}</p>
        <p class="qp-breakout-screen-score">${i("screenCompleteScore",e,t.score)}</p>
        <p>${i("screenCompleteText",e)}</p>
      </div>`,dynamicFields:[{selector:".qp-breakout-screen-score",dictKey:"screenCompleteScore",dataKey:"score"},{selector:".qp-breakout-screen-level",dictKey:"screenLevel",dataKey:"level"},{selector:".qp-breakout-screen-lives",dictKey:"screenRemainingLives",dataKey:"lives"}]},{state:"stopped",cssClasses:["qp-breakout-screen"],template:(i,e,t)=>`
      <div class="qp-breakout-screen-content">
        <h1>${i("screenGameoverTitle",e)}</h1>
        <p class="qp-breakout-screen-score">${i("screenCompleteScore",e,t.score)}</p>
        <p class="qp-breakout-screen-level">${i("screenLevel",e,t.level)}</p>
        <p>${i("screenGameoverText",e)}</p>
      </div>`,dynamicFields:[{selector:".qp-breakout-screen-score",dictKey:"screenCompleteScore",dataKey:"score"},{selector:".qp-breakout-screen-level",dictKey:"screenLevel",dataKey:"level"}]}],q=class{constructor(e){this.state=e.state,this._template=e.template,this._cssClasses=e.cssClasses,this._dynamicFields=e.dynamicFields||[],this._onShow=e.onShow||null,this._styleProps=e.styleProps||null,this.el=null}create(e,t,s,a,r){if(this.el=document.createElement("div"),this.el.classList.add(...this._cssClasses),this.el.innerHTML=this._template(t,s,a),this._styleProps){let h=this._styleProps(r);Object.entries(h).forEach(([n,l])=>{this.el.style.setProperty(n,l)})}e.appendChild(this.el)}update(e,t,s){this.el&&(this._dynamicFields.forEach(({selector:a,dictKey:r,dataKey:h})=>{let n=this.el.querySelector(a);n&&(n.textContent=e(r,t,s[h]))}),this._onShow&&this._onShow(this.el,e,t,s))}show(){this.el?.classList.add("qp-breakout-screen-visible")}hide(){this.el?.classList.remove("qp-breakout-screen-visible")}resize(e,t){this.el&&(this.el.style.width=e,this.el.style.height=t)}destroy(){this.el?.remove(),this.el=null}},m=class{constructor(e){this._wrapper=e.wrapper,this._dict=e.dict,this._logoSrc=e.logoSrc,this._screens=new Map}init(e,t){R.forEach(s=>{let a=new q(s);a.create(this._wrapper,this._dict,e,t,this._logoSrc),this._screens.set(s.state,a)})}show(e,t,s){this._screens.forEach(r=>r.hide());let a=this._screens.get(e);a&&(a.update(this._dict,t,s),a.show())}resize(e,t){this._screens.forEach(s=>s.resize(e,t))}destroy(){this._screens.forEach(e=>e.destroy()),this._screens.clear()}};var f=class i extends HTMLElement{static COLS=8;static ROWS=4;static LIVES=3;static EXTRA_LIVE=1e3;static PADDLE_SPEED=6;static MARGIN=4;static PREVENT_KEYCODES=new Set([13,27,32,37,38,39,40]);static get observedAttributes(){return["width","scale","lang","use-images"]}constructor(){super(),this.attachShadow({mode:"open"}),this._lang="de",this._width=null,this._scale=.75,this._useImages=!0,this._bgCanvas=null,this._logoCanvas=null,this._bricksCanvas=null,this._gameCanvas=null,this._images=null,this._stars=null,this._logoImage=null,this._parallaxFactor=2,this._wrapper=null,this._counter=null,this._output=null,this._stateNode=null,this._btnStop=null,this._btnStart=null,this._btnPause=null,this._screenController=null,this._hLoopTimer=null,this._ball={x:0,y:0,dx:0,dy:0},this._ballSpeed={x:140,y:140},this._paddle=null,this._bricks=[],this._cols=i.COLS,this._levels=C,this._currentLevelDef=null,this._score=0,this._lives=i.LIVES,this._speed=0,this._level=1,this._remaining=0,this._setState("init"),this._handleKeyDown=this._handleKeyDown.bind(this),this._handleKeyUp=this._handleKeyUp.bind(this),this._checkPaddleCollision=this._checkPaddleCollision.bind(this),this._gameLoop=this._gameLoop.bind(this),this._handleStopClick=this._handleStopClick.bind(this),this._handleStartClick=this._handleStartClick.bind(this),this._handlePauseClick=this._handlePauseClick.bind(this),this._initializeDictionary()}async connectedCallback(){await this._loadImages(),this._render()}disconnectedCallback(){this._reset()}attributeChangedCallback(e,t,s){if(t!==s){switch(e){case"width":this._width=Number(s)||null;break;case"scale":this._scale=Math.min(Number(s)||.75,1);break;case"lang":this._lang=s,this._initializeDictionary();break;case"use-images":this._useImages=s!=="false",this.isConnected&&this._gameCanvas&&this._bricksCanvas&&this._loadImages().then(()=>this._render());return}this.isConnected&&this._gameCanvas&&this._bricksCanvas&&this._render()}}_reset(){this._stopLoop(),this._removeEvents(),this._bgCanvas?.destroy(),this._logoCanvas?.destroy(),this._bricksCanvas?.destroy(),this._gameCanvas?.destroy(),this._bgCanvas=null,this._logoCanvas=null,this._bricksCanvas=null,this._gameCanvas=null,this._stars=null,this._screenController?.destroy(),this._screenController=null,this._setState("init")}_initializeDictionary(){this._dict=(e,...t)=>{try{let s=t.splice(0,1)[0],a=this._lang||"de";return x.includes(s)?a=s:(t.length>0||s!==void 0)&&(t=[s,...t]),y(t)[e]?.[a]||e}catch{return this._defaultDict(e,this._lang||"de",t)}}}_defaultDict(e,t="de",s=[]){return{funBreakoutStart:{de:"Start",en:"Start"},funBreakoutStop:{de:"Stop",en:"Stop"},funBreakoutPause:{de:"Pause",en:"Pause"},funBreakoutGameOver:{de:"Game Over",en:"Game Over"},scoreboardSize:{de:`Spalten: ${s[0]}, Reihen: ${s[1]}`,en:`Cols: ${s[0]}, Rows: ${s[1]}`},scoreboardScore:{de:`Punkte: ${s[0]}`,en:`Score: ${s[0]}`},scoreboardSpeed:{de:`Speed: ${s[0]}`,en:`Speed: ${s[0]}`},scoreboardLevel:{de:`Level: ${s[0]}`,en:`Level: ${s[0]}`},scoreboardLives:{de:`Leben: ${s[0]}`,en:`Lives: ${s[0]}`},scoreboardRemainingBricks:{de:`Bricks: ${s[0]}`,en:`Bricks: ${s[0]}`},screenInitTitle:{de:"QP Breakout",en:"QP Breakout"},screenInitText:{de:"Start dr\xFCcken oder Leertaste",en:"Press start or space to play"},screenWaitingTitle:{de:"Breakout",en:"Breakout"},screenWaitingText:{de:"Pfeiltasten links und rechts zum Bewegen",en:"Use Arrow keys left and right to move"},screenWaitingAction:{de:"Leertaste zum Starten",en:"Press space to start"},screenPausedTitle:{de:"Pausiert",en:"Paused"},screenPausedText:{de:"Leertaste zum Fortsetzen",en:"Press space to resume"},screenLevel:{de:`Level: ${s[0]}`,en:`Level: ${s[0]}`},screenCompleteTitle:{de:"Level geschafft",en:"Level Complete"},screenCompleteScore:{de:`Punkte: ${s[0]}`,en:`Score: ${s[0]}`},screenCompleteText:{de:"Leertaste zum Weiterspielen",en:"Press space to continue"},screenGameoverTitle:{de:"Game Over",en:"Game Over"},screenGameoverText:{de:"Start oder Leertaste dr\xFCcken zum Neustarten",en:"Press start or space to restart"},screenRemainingLives:{de:`Leben: ${s[0]}`,en:`Lives: ${s[0]}`},scoreboardState_init:{de:"QP Breakout",en:"QP Breakout"},scoreboardState_waiting:{de:"Bereit",en:"Ready"},scoreboardState_complete:{de:"Level geschafft",en:"Level Complete"},scoreboardState_paused:{de:"Pausiert",en:"Paused"},scoreboardState_running:{de:"Running",en:"Running"},scoreboardState_stopped:{de:"Stop",en:"Stopped"}}[e]?.[t]||e}_attachEvents(){this._btnStart&&this._btnStart.addEventListener("click",this._handleStartClick),this._btnPause&&this._btnPause.addEventListener("click",this._handlePauseClick),this._btnStop&&this._btnStop.addEventListener("click",this._handleStopClick),window.addEventListener("keydown",this._handleKeyDown),window.addEventListener("keyup",this._handleKeyUp)}_removeEvents(){this._btnStart&&this._btnStart.removeEventListener("click",this._handleStartClick),this._btnPause&&this._btnPause.removeEventListener("click",this._handlePauseClick),this._btnStop&&this._btnStop.removeEventListener("click",this._handleStopClick),window.removeEventListener("keydown",this._handleKeyDown),window.removeEventListener("keyup",this._handleKeyUp)}_dispatchEvent(e,t={}){this.dispatchEvent(new CustomEvent(e,{bubbles:!0,composed:!0,detail:t}))}_handleStartClick(){this._startGame()}_handleStopClick(){(this._state==="running"||this._state==="paused")&&this._gameOver()}_handlePauseClick(){this._state==="init"||this._state==="stopped"?this._startGame():this._state==="complete"?this._nextLevel():this._state==="paused"?this._resumeGame():this._pauseGame()}_handleKeyDown(e){switch(i.PREVENT_KEYCODES.has(e.keyCode)&&e.preventDefault(),e.key){case"ArrowRight":(this._state==="running"||this._state==="waiting")&&this._paddle.setSpeed("right");break;case"ArrowLeft":(this._state==="running"||this._state==="waiting")&&this._paddle.setSpeed("left");break;case" ":this._state==="waiting"?(this._ball.launch(),this._setState("running")):this._handlePauseClick();break;case"Escape":this._handleStopClick();break;case"t":this._state==="running"&&(this._bricks.flat().filter(s=>s?.visible).slice(0,-1).forEach(s=>{for(;s.hits>0;)s.hit();this._score+=s.score}),this._remaining=1,this._setCounter(),this._bricksCanvas.clear(),this._drawBricks(),this._setOutput());break}}_handleKeyUp(e){if(i.PREVENT_KEYCODES.has(e.keyCode)&&e.preventDefault(),!(this._state!=="running"&&this._state!=="waiting"))switch(e.key){case"ArrowRight":case"ArrowLeft":this._paddle.setSpeed("right",0);break}}_initCanvas(){let e={wrapper:this._wrapper,width:this._width,scale:this._scale};this._bgCanvas=new b({...e,cssClass:"qp-breakout-bg-canvas",onResize:()=>{this._syncLayoutWidth(),this._screenController?.resize(this._bgCanvas.width+"px",this._bgCanvas.height+"px"),this._drawInitialBackground()}}),this._bgCanvas.create(),this._bgCanvas.observe(),this._logoCanvas=new b({...e,cssClass:"qp-breakout-logo-canvas"}),this._logoCanvas.create(),this._logoCanvas.observe(),this._bricksCanvas=new b({...e,cssClass:"qp-breakout-bricks-canvas"}),this._bricksCanvas.create(),this._bricksCanvas.observe(),this._gameCanvas=new b(e),this._gameCanvas.create(),this._gameCanvas.observe(),this._initStars(),this._drawInitialBackground()}_initStars(){this._stars=new g({count:150,canvasWidth:this._bgCanvas.width,canvasHeight:this._bgCanvas.height,ctx:this._bgCanvas.ctx}),this._stars.generate()}_drawInitialBackground(){!this._stars||!this._logoImage||!this._logoCanvas||(this._stars.draw(),this._drawLogo(0,0))}_drawLogo(e=0,t=0){if(!this._logoImage)return;let s=this._logoCanvas.width,a=this._logoCanvas.height,r=s*.4;this._logoCanvas.ctx.save(),this._logoCanvas.ctx.globalAlpha=.25,this._logoCanvas.ctx.translate((s-r)/2+e,(a-r)/2+a*.1+t),this._logoCanvas.ctx.drawImage(this._logoImage,0,0,r,r),this._logoCanvas.ctx.restore()}async _loadImages(){if(this._logoImage=await this._loadImage("./images/qp-logo-horns-flash.svg"),!this._useImages){this._images=null;return}let e="./images/breakout",t=Object.values(k).filter(s=>s!==null&&s.image).map(s=>s.image);try{let[s,a,...r]=await Promise.all([this._loadImage(`${e}/ball.png`),this._loadImage(`${e}/paddle.png`),...t.map(n=>this._loadImage(`${e}/${n}.png`))]),h={};t.forEach((n,l)=>{h[n]=r[l]}),this._images={ball:s,paddle:a,bricks:h}}catch(s){console.warn("QPBreakout: Failed to load sprite images, falling back to drawn mode.",s),this._images=null}}_loadImage(e){return new Promise((t,s)=>{let a=new Image;a.onload=()=>t(a),a.onerror=s,a.src=new URL(e,import.meta.url).href})}_drawParallax(){let e=(this._paddle.x/this._gameCanvas.width-.5)*this._parallaxFactor;this._bgCanvas.clear(),this._bgCanvas.ctx.save(),this._bgCanvas.ctx.translate(e*-4,e*-3),this._stars.draw(),this._bgCanvas.ctx.restore(),this._logoCanvas.clear(),this._drawLogo(e*-10,e*-6)}_syncLayoutWidth(){let e=this._bgCanvas?.width;if(!e)return;let t=e+"px";this._scoreboard&&(this._scoreboard.style.maxWidth=t),this._buttonBar&&(this._buttonBar.style.maxWidth=t)}_startGame(){this._state!=="running"&&(this._lives=i.LIVES,this._score=0,this._level=1,this._currentLevelDef=this._getLevelDef(this._level),this._setPaddle(),this._initRound(),this._dispatchEvent("qp-breakout.game-started",{lives:this._lives,score:this._score,level:this._level}))}_initRound(){this._gameCanvas.clear(),this._bricksCanvas.clear(),this._setBall(),this._setBricks(),this._remaining=this._bricks.flat().filter(e=>e?.visible).length,this._drawBricks(),this._paddle.centerOn(this._gameCanvas.width),this._ball.attachTo(this._paddle),this._setState("waiting"),this._setCounter(),this._setOutput(),this._gameLoop()}_pauseGame(e="paused"){this._stopLoop(),this._setState(e),this._dispatchEvent("qp-breakout.game-paused",{lives:this._lives,score:this._score,level:this._level})}_resumeGame(){this._gameLoop(),this._setState("running"),this._dispatchEvent("qp-breakout.game-resumed",{lives:this._lives,score:this._score,level:this._level})}_nextLevel(){this._level++,this._currentLevelDef=this._getLevelDef(this._level),this._initRound(),this._dispatchEvent("qp-breakout.game-level-up",{lives:this._lives,score:this._score,level:this._level})}_gameOver(){this._stopLoop(),this._gameCanvas.clear(),this._setState("stopped"),this._setOutput(),this._dispatchEvent("qp-breakout.game-over",{lives:this._lives,score:this._score,level:this._level})}_gameLoop(){if(this._gameCanvas.clear(),this._drawParallax(),this._paddle.move(),this._ball.attached){this._ball.attachTo(this._paddle),this._ball.draw(),this._paddle.draw(),this._hLoopTimer=requestAnimationFrame(this._gameLoop);return}if(this._ball.move(),!!this._checkPaddleCollision()){if(this._checkBrickCollision()){if(this._bricksCanvas.clear(),this._setOutput(),this._remaining<=0){this._score+=this._currentLevelDef.score,this._dispatchEvent("qp-breakout.level-complete",{lives:this._lives,score:this._score,level:this._level}),this._pauseGame("complete");return}this._drawBricks()}this._ball.draw(),this._paddle.draw(),this._hLoopTimer=requestAnimationFrame(this._gameLoop)}}_stopLoop(){this._hLoopTimer&&(cancelAnimationFrame(this._hLoopTimer),this._hLoopTimer=null)}_setPaddle(){this._paddle=new _({paddleWidth:Math.round(this._gameCanvas.width/6),paddleHeight:Math.round(this._gameCanvas.width/6/7),speed:i.PADDLE_SPEED,canvasWidth:this._gameCanvas.width,canvasHeight:this._gameCanvas.height,ctx:this._gameCanvas.ctx,image:this._images?.paddle||null})}_setBall(){this._ball=new u({ballRadius:Math.round(this._gameCanvas.width/80),speedX:Math.round(this._gameCanvas.width/this._ballSpeed.x),speedY:-Math.round(this._gameCanvas.width/this._ballSpeed.y),canvasWidth:this._gameCanvas.width,canvasHeight:this._gameCanvas.height,ctx:this._gameCanvas.ctx,image:this._images?.ball||null})}_setBricks(){let e=this._currentLevelDef,t;e&&e.layout?t=e.layout:e&&e.random?t=this._generateRandomLayout(e.random):t=this._generateFullGrid(i.ROWS,this._cols),this._bricks=[];let s=t.length,a=Math.max(...t.map(c=>c.length)),r=this._bricksCanvas.width,h=r<480?i.MARGIN-1:i.MARGIN,n=(r-h*(a+1))/a,l=Math.round(n/3);for(let c=0;c<s;c++){this._bricks[c]=[];for(let o=0;o<a;o++){let d=t[c][o]||0,p=k[d];p?this._bricks[c].push(new v({x:h+o*(n+h),y:h+c*(l+h),width:n,height:l,fill:p.color,score:p.score,hits:p.hits,ctx:this._bricksCanvas.ctx,image:this._images?.bricks[p.image]||null})):this._bricks[c].push(null)}}}_drawBricks(){for(let e=0;e<this._bricks.length;e++)for(let t=0;t<this._bricks[e].length;t++){let s=this._bricks[e][t];s?.visible&&s.draw()}}_checkPaddleCollision(){if(this._ball.dy>0&&this._ball.y+this._ball.radius>=this._paddle.y){if(this._ball.y+this._ball.radius<this._paddle.y+this._paddle.height&&this._ball.x+this._ball.radius>this._paddle.x&&this._ball.x-this._ball.radius<this._paddle.x+this._paddle.width){let t=(1-(this._ball.x-(this._paddle.x+this._paddle.width/2))/(this._paddle.width/2))*Math.PI/3+Math.PI/6,s=Math.sqrt(this._ball.dx**2+this._ball.dy**2);this._ball.dx=s*Math.cos(t),this._ball.dy=-s*Math.sin(t)}else if(this._ball.y-this._ball.radius>this._gameCanvas.height){if(this._lives--,this._setCounter(),this._dispatchEvent("qp-breakout.game-life-lost",{lives:this._lives}),this._lives<=0)return this._gameOver(),!1;this._paddle.centerOn(this._gameCanvas.width),this._ball.attachTo(this._paddle),this._setState("waiting")}}return!0}_checkBrickCollision(){let e=this._ball.radius,t=!1;for(let s=0;s<this._bricks.length;s++)for(let a=0;a<this._bricks[s].length;a++){let r=this._bricks[s][a];if(r?.visible&&this._ball.x+e>r.x&&this._ball.x-e<r.x+r.width&&this._ball.y+e>r.y&&this._ball.y-e<r.y+r.height){if(this._ball.dy<0&&this._ball.y-e<=r.y+r.height?this._ball.dy*=-1:this._ball.dy>0&&this._ball.y+e>=r.y?this._ball.dy*=-1:this._ball.dx*=-1,r.hit()){this._remaining--;let n=Math.floor(this._score/i.EXTRA_LIVE);this._score+=r.score;let c=Math.floor(this._score/i.EXTRA_LIVE)-n;this._lives+=c,c>0&&this._dispatchEvent("qp-breakout.game-extra-life",{lives:this._lives,score:this._score,level:this._level})}this._setCounter(),t=!0}}return t}_getLevelDef(e){let t=e-1;if(t<this._levels.length)return this._levels[t];let s=t-this._levels.length+1;return{name:"Random",random:{rows:Math.min(7,4+Math.floor(s/2)),cols:this._cols,fillRatio:Math.min(.9,.5+s*.05),maxType:Math.min(8,6+Math.floor(s/3))}}}_generateRandomLayout({rows:e,cols:t,fillRatio:s=.7,maxType:a=6}){e=e||i.ROWS,t=t||i.COLS;let r=e*t,h=Math.max(1,Math.round(r*s)),n=Array.from({length:e},()=>Array(t).fill(0)),l=[];for(let o=0;o<e;o++)for(let d=0;d<t;d++)l.push([o,d]);for(let o=l.length-1;o>0;o--){let d=Math.floor(Math.random()*(o+1));[l[o],l[d]]=[l[d],l[o]]}for(let o=0;o<h;o++){let[d,p]=l[o],S=Math.min(a,Math.max(1,Math.ceil((e-d)/e*a)));n[d][p]=S}let c=n[e-1];return c.every(o=>o===0)&&(c[Math.floor(Math.random()*t)]=1),n}_generateFullGrid(e,t){let s=[];for(let a=0;a<e;a++){let r=Math.min(6,Math.max(1,e-a));s.push(Array(t).fill(r))}return s}_setState(e){if(e&&(this._state=e),!this._stateNode)return;let t=this._state==="stopped"&&this._lives<=0?this._dict("funBreakoutGameOver",this._lang):this._dict(`scoreboardState_${this._state}`,this._lang);this._stateNode.textContent=t,this._screenController?.show(this._state,this._lang,{score:this._score,level:this._level,lives:this._lives})}_setCounter(){this._counter&&(this._counter.innerHTML=`${this._dict("scoreboardLevel",this._lang,this._level)}<br  />${this._dict("scoreboardScore",this._lang,this._score)}<br  />${this._dict("scoreboardLives",this._lang,this._lives)}`)}_setOutput(){this._output&&(this._output.textContent=`${this._dict("scoreboardRemainingBricks",this._lang,this._remaining)}`)}_setStyles(){return w.call(this)}_setNodes(){this._btnStop=this.shadowRoot.querySelector(".qp-breakout-btn-stop"),this._btnStart=this.shadowRoot.querySelector(".qp-breakout-btn-start"),this._btnPause=this.shadowRoot.querySelector(".qp-breakout-btn-pause"),this._wrapper=this.shadowRoot.querySelector(".qp-breakout-wrapper"),this._scoreboard=this.shadowRoot.querySelector(".qp-scoreboard"),this._output=this.shadowRoot.querySelector(".qp-scoreboard-output"),this._stateNode=this.shadowRoot.querySelector(".qp-scoreboard-state"),this._counter=this.shadowRoot.querySelector(".qp-scoreboard-counter"),this._buttonBar=this.shadowRoot.querySelector(".qp-breakout-button-bar")}_render(){this._reset(),this.shadowRoot.innerHTML=`
    ${this._setStyles()}
    ${this._createScoreboard()}
    ${this._createCanvas()}
    ${this._createButtonBar()}
    `,this.isConnected&&(this._setNodes(),this._initCanvas(),this._syncLayoutWidth(),this._screenController=new m({wrapper:this._wrapper,dict:this._dict,logoSrc:this._logoImage.src}),this._screenController.init(this._lang,{score:this._score,level:this._level,lives:this._lives}),this._screenController.resize(this._bgCanvas.width+"px",this._bgCanvas.height+"px"),this._attachEvents(),this._setState())}_createScoreboard(){return`
    <div class="qp-scoreboard">
      <div class="qp-scoreboard-state">---</div>
      <div class="qp-scoreboard-output">---</div>
      <div class="qp-scoreboard-counter">${this._dict("scoreboardLevel",this._lang,this._level)}<br  />${this._dict("scoreboardScore",this._lang,this._score)}<br  />${this._dict("scoreboardLives",this._lang,this._lives)}</div>
    </div>`}_createCanvas(){return`
      <div class="qp-breakout-wrapper"></div>`}_createButtonBar(){return`
      <div class="qp-breakout-button-bar">
        <button class="qp-btn qp-btn-primary qp-breakout-btn-start">${this._dict("funBreakoutStart",this._lang)}</button>
        <button class="qp-btn qp-btn-cta qp-breakout-btn-pause">${this._dict("funBreakoutPause",this._lang)}</button>
        <button class="qp-btn qp-btn-secondary qp-breakout-btn-stop">${this._dict("funBreakoutStop",this._lang)}</button>
      </div>`}};customElements.define("qp-breakout",f);var X=f;export{X as default};
//# sourceMappingURL=qp-breakout.bundle.js.map
