'use strict'

/*
	Fabián Doñaque
	Fabs Robotics SLU
	createdOn: 2020-04-14
	modifiedOn: 2020-04-20
	Apuntes:
		1.- La comunicación de cada elemento con el exterior se hará mediante CustomEvent
*/

///////////////
//  Classes  //
///////////////

class ElementEvent {
	constructor(name,outputs,description){
		this.name = name;
		this.outputs = outputs;
		this.description = description;
	}
}

class ElementAttribute {
	constructor(name,inputs,description){
		this.name = name;
		this.inputs = inputs;
		this.description = description;
	}
}

class ElementMethod extends ElementAttribute {
	constructor(name,inputs,outputs,description){
		super(name,inputs,description);
		this.outputs = outputs;
	}
}
class FabsElement extends HTMLElement {
	constructor() {
		super();
		this.about = {
			"parentClass":'HTMLElement',
			"createdBy":"Fabián Doñaque",
			"company":"Fabs Robotics",
			"createdOn": '2020-04-16',
			"modifiedOn": '2020-04-17',
			"methods":[],
			"attributes":[],
			"events": []
		}
		let shadow = this.attachShadow({mode: 'open'});
		shadow.innerHTML = `
			<style>
				:host{
					--background-color: transparent;
					--text-color: black;
					--fabs-color: #f2a72e;

					position: relative;
					display: block;
					width: 100%;
					height: 100%;
					overflow:hidden;
					background-color: var(--background-color);
					color: var(--text-color);
				}
				*{
					margin: 0;
					padding: 0;
					border: 0;
				}
			</style>
		`;
		this.observer = new MutationObserver((mutations) => {
			this.dispatchEvent(new CustomEvent('LightDOMChanged',{
				detail: {
					addedNodes: mutations[0].addedNodes,
					removedNodes: mutations[0].removedNodes
				}
			}));
		});

		this.observer.observe(this, {
			childList: true
		});
	}

	disconnectedCallback(){
		if(this.observer) this.observer.disconnect();
	}
}

/////////////
//  Views  //
/////////////

class View extends FabsElement {
	constructor(){
		super();
		this.about.parentClass = "FabsComponent";
		this.about.createdOn = "2019-09-01";
		this.about.createdOn = "2020-04-16";
		this.shadowRoot.innerHTML += `
			<slot><slot>
		`;
	}
}

class CenterText extends FabsElement {

	constructor(){
		super();
		this.about.parentClass = "FabsComponent";
		this.about.createdOn = "2020-04-15";
		this.about.createdOn = "2020-04-16";
	}

	connectedCallback(){
		this.shadowRoot.innerHTML += `
			<style>
				:host{
					display: flex;
					align-items: center;
				}
				span{
					padding-left: 1em;
				}
			</style>
			<span>
				<slot></slot>
			</span>
		`;

		this.addEventListener('LightDOMChanged', e => {
			this.updateText();
		});
	}

	static get observedAttributes(){
		return ['textcolor','backgroundcolor',"style"];
	}

	attributeChangedCallback(name, oldValue, newValue){
		if(name == "textcolor"){
			this.shadowRoot.host.style.setProperty('--text-color',newValue);
		}
		if(name == "backgroundcolor"){
			this.shadowRoot.host.style.setProperty('--background-color',newValue);
		}
		if(name == "style"){
			this.updateText();
		}
	}

	updateText(){
		const text = this.innerText;
		const textLength = text.length;
		if(textLength == 0) return;
		const totalWidth = this.clientWidth;

		const canvas = document.createElement('canvas');
		const ctx = canvas.getContext('2d');
		ctx.font = getComputedStyle(this).font;

		const dotWidth = ctx.measureText(".").width;
		const mWidth = ctx.measureText("m").width;
		const textWidth = ctx.measureText(text).width;

		/*console.log("textLength",textLength);
		console.log("totalWidth",totalWidth);
		console.log(ctx.font);
		console.log("dots",ctx.measureText("..").width);
		console.log("other",ctx.measureText("  ").width);
		console.log("textWidth",textWidth);
		console.log("height",this.clientHeight);*/

		if(totalWidth < textWidth){
			const charWidth = textWidth/textLength;
			const textMaxLength = Math.floor((totalWidth-2*mWidth-3*dotWidth)/charWidth);
			const newText = text.substr(0,textMaxLength) + "...";
			this.innerHTML = newText;
			const newTextWidth = ctx.measureText(newText).width;
			if(newTextWidth >= totalWidth && this.observer) this.observer.disconnect();

			/*console.log("newTextLength",newText.length);
			console.log("newTextWidth",ctx.measureText(newText).width);*/
		}
	}
}

class CenterView extends HTMLElement {
    constructor()
    {
        super();
        var shadow = this.attachShadow({mode: 'open'});
        shadow.innerHTML = `
        <style>
            :host{
                position:relative;
                width: 100%;
                height: 100%;
                display:flex;
                align-items: center;
                justify-content: center;
                overflow-y: scroll;
            }
            #box{
                width:50%;
                display:block;
            }
        </style>
        <div id="box">
            <slot>
            </slot>
        </div>
        `;
    }
    static get observedAttributes(){
        return ['max-internal-width','max-internal-height','internal-width','internal-height'];
    }

    attributeChangedCallback(name, oldValue, newValue){

        if(name == "max-internal-width"){
            this.shadowRoot.getElementById('box').style.maxWidth = newValue;
        }

        if(name == "max-internal-height"){
            this.shadowRoot.getElementById('box').style.maxHeight = newValue;
        }

        if(name == "internal-width"){
            this.shadowRoot.getElementById('box').style.width = newValue;
        }

        if(name == "internal-height"){
            this.shadowRoot.getElementById('box').style.height = newValue;
        }
    }

    about(){
        var about = {
            "Description":"Elemento Center View, ocupa el 100% del espacio disponible y deja el contenido en el centro de este elemento.",
            "CreatedBy":"Fabián Doñaque",
            "Company":"Fabs Robotics",
            "CreatedOn":"Sept 2019",
            "ModifiedOn":"Oct 2019",
            "Methods":[],
            "Attributes":[
                {
                    'Name':'max-internal-width',
                    'Description':'Ancho máximo que tiene el marco interno'
                },
                {
                    'Name':'max-internal-height',
                    'Description':'Alto máximo que tiene el marco interno'
                },
                {
                    'Name':'internal-width',
                    'Description':'Ancho que tiene el marco interno'
                },
                {
                    'Name':'internal-height',
                    'Description':'Alto que tiene el marco interno'
                }
                ]
        }
        return(about);
    }
}

///////////////
//  Symbols  //
///////////////

class ButtonSymbol extends FabsElement {
	constructor(){
		super();
		this.about.parentClass = "FabsElement";
		this.about.description = "Botón con symbolo";
		this.about.createdOn = "2020-04-19";
		this.about.modifieOn = "2020-04-19";

		///////////////
		//  Symbols  //
		///////////////

		this.crossSymbol = `
			<svg viewbox="0 0 3 3">
				<rect x="1" y="0" width="1" height="3" fill="#f2a72e" class="symbol"/>
				<rect x="0" y="1" width="3" height="1" fill="#f2a72e" class="symbol"/>
			</svg>
		`;

		this.deleteSymbol = `
			<svg viewbox="0 0 6 6">
				<rect x="2" y="0" width="2" height="6" fill="#ff0000" class="symbol" transform="rotate(45,3,3)"/>
				<rect x="0" y="2" width="6" height="2" fill="#ff0000" class="symbol" transform="rotate(45,3,3)"/>
			</svg>
		`;

		this.downArrowSymbol = `
			<svg viewbox="0 0 3 3">
				<polygon points="0,0.2010 3,0.2010 1.5,2.7991" fill="#f2a72e" class="symbol"/>
			</svg>
		`;

		this.upArrowSymbol = `
			<svg viewbox="0 0 3 3">
				<polygon points="0,2.799 3,2.799 1.5,0.2010" fill="#f2a72e" class="symbol"/>
			</svg>
		`;

		this.leftArrowSymbol = `
			<svg viewbox="0 0 3 3">
				<polygon points="2.799,0 2.799,3 0.2010,1.5" fill="#f2a72e" class="symbol"/>
			</svg>
		`;

		this.rightArrowSymbol = `
			<svg viewbox="0 0 3 3">
				<polygon points="0.2010,0 0.2010,3 2.799,1.5" fill="#f2a72e" class="symbol"/>
			</svg>
		`;

		this.checkMarkSymbol = `
			<svg viewbox="0 0 100 100">
				<circle cx="50" cy="50" r="50" fill="green" class="symbol"></circle>
				<rect x="30" y="60" width="40" height="20" fill="white" transform="rotate(45,50,50)"></rect>
				<rect x="50" y="10" width="20" height="60" fill="white" transform="rotate(45,50,50)"></rect>
			</svg>
		`;

		this.shadowRoot.innerHTML += `
		<style>
			#container {
				position: relative;
				display: flex;
				align-items: center;
				justify-content: center;
				width: 100%;
				height: 100%;
				cursor: pointer;
			}

			svg {
				width: 80%;
				height: 80%;
				overflow: visible;
			}
		</style>
		<div id="container">
		</div>
		`;
	}

	static get observedAttributes(){
		return ['symbol','color','enable'];
	}

	get symbol(){
		return this.getAttribute('symbol');
	}

	set symbol(val){
		if (val) this.setAttribute('symbol', val);
		else this.removeAttribute('symbol');
	}

	get color(){
		return this.getAttribute('color');
	}

	set color(val){
		if (val) this.setAttribute('color', val);
		else this.removeAttribute('color');
	}

	get enable(){
		return this.getAttribute('enable');
	}

	set enable(val){
		if (val) this.setAttribute('enable', val);
		else this.removeAttribute('enable');
	}

	attributeChangedCallback(name, oldValue, newValue){
		switch (name) {
			case "symbol":
				this.setShape(newValue);
				break;
			case "color":
				this.shadowRoot.querySelector('.symbol').style.fill = newValue;
				break;
			case "enable":
				if(newValue) this.shadowRoot.querySelector('#container').style.cursor = 'pointer';
				else this.shadowRoot.querySelector('#container').style.cursor = 'default';
		}
	}

	setShape(shape){
		const container = this.shadowRoot.querySelector('#container');
		switch (shape) {
			case "leftArrow":
				container.innerHTML = this.leftArrowSymbol;
				break;
			case "rightArrow":
				container.innerHTML = this.rightArrowSymbol;
				break;
			case "upArrow":
				container.innerHTML = this.upArrowSymbol;
				break;
			case "downArrow":
				container.innerHTML = this.downArrowSymbol;
				break;
			case "cross":
				container.innerHTML = this.crossSymbol;
				break;
			case "delete":
				container.innerHTML = this.deleteSymbol;
				break
			case "checkMark":
				container.innerHTML = this.checkMarkSymbol;
				break;
			default:
				container.innerHTML = "";
		}
	}
}

///////////////
//  Buttons  //
///////////////

class AddButton extends FabsElement {
	constructor(){
		super();
		this.about.parentClass = "FabsComponent";
		this.about.createdOn = "2019-09-01";
		this.about.createdOn = "2020-04-17";

		this.shadowRoot.innerHTML += `
        <style>
            :host{
                --element-color: var(--fabs-color);
                --size: 1px;
                cursor:pointer;
            }
            #vertical {
              background: var(--element-color);
              position: absolute;
              top: calc( var(--size) / 3 );
              left: calc( ( 100% - ( var(--size) / 3 ) ) / 2 );
              height: var(--size);
              width: calc( var(--size) / 3 );
            }
            #horizontal {
              background: var(--element-color);
              position: absolute;
              top: calc( ( 100% - ( var(--size) / 3 ) ) / 2 );
              left: calc( ( 100% - var(--size) ) / 2 );
              height: calc( var(--size) / 3 );
              width: var(--size)
            }
        </style>
		<fabs-view>
			<div id="vertical"></div>
    		<div id="horizontal"></div>
		</fabs-view>
        `;
	}

	connectedCallback(){
    }

	static get observedAttributes(){
		return ['color','backgroundcolor','size','style','disabled'];
	}

    attributeChangedCallback(name, oldValue, newValue){
        if(name == "color"){
            this.shadowRoot.host.style.setProperty('--element-color',newValue);
        }
        if(name == "backgroundcolor"){
            this.shadowRoot.host.style.setProperty('--background-color',newValue);
        }
        if(name == "style"){
			let value = 'calc( 3 * '+this.style.height+' / 5 )';
			let size = this.shadowRoot.host.style.getPropertyValue('--size');
			if(size !== value) this.shadowRoot.host.style.setProperty('--size',value);
        }
		if(name == "disabled"){
			this.shadowRoot.host.style.cursor = "inherit";
        }
    }



	get disabled(){
		return this.hasAttribute('disabled');
	}

	set disabled(val){
		if (val) {
			this.shadowRoot.host.style.cursor = "inherit";
			this.setAttribute('disabled', '');
		} else {
			this.shadowRoot.host.style.cursor = "pointer";
			this.removeAttribute('disabled');
		}
	}
}

class OptionButton extends FabsElement {
	constructor(){
		super();
		this.about.parentClass = "FabsComponent";
		this.about.createdOn = "2019-09-01";
		this.about.createdOn = "2020-04-17";

		this.shadowRoot.innerHTML += `
			<style>
				:host{
					--element-color: var(--fabs-color);
					--triangle-height: 100px;
					cursor:pointer;
					background-color: var(--background-color);
					display: flex;
					align-items: center;
					justify-content: center;
				}
				#equilateralTriangle {
					width: 0;
					height: 0;
					border-right: calc( var(--triangle-height) * 0.5773502692) solid transparent;
					border-left: calc( var(--triangle-height) * 0.5773502692) solid transparent;
					border-top: var(--triangle-height) solid var(--element-color);
				}
			</style>
			<div id="equilateralTriangle"></div>
		`;
	}

	connectedCallback(){
    }

	static get observedAttributes(){
		return ['color','backgroundcolor','size','style','disabled'];
	}

    attributeChangedCallback(name, oldValue, newValue){
        if(name == "color"){
            this.shadowRoot.host.style.setProperty('--element-color',newValue);
        }
        if(name == "backgroundcolor"){
            this.shadowRoot.host.style.setProperty('--background-color',newValue);
        }
        if(name == "style"){
			let size = this.shadowRoot.host.style.getPropertyValue('--triangle-height');
			let value = Math.floor(3 * this.offsetHeight / 5) + "px";
			if(size !== value) this.shadowRoot.host.style.setProperty('--triangle-height',value);
        }
		if(name == "disabled"){
			this.shadowRoot.host.style.cursor = "inherit";
        }
    }



	get disabled(){
		return this.hasAttribute('disabled');
	}

	set disabled(val){
		if (val) {
			this.shadowRoot.host.style.cursor = "inherit";
			this.setAttribute('disabled', '');
		} else {
			this.shadowRoot.host.style.cursor = "pointer";
			this.removeAttribute('disabled');
		}
	}
}

class AddLabeledButton extends HTMLElement {
    // Métodos de clase
    constructor()
    {
        super();
        var shadow = this.attachShadow({mode: 'open'});
        shadow.innerHTML = `
        <style>
            *{
                margin: 0;
                padding: 0;
                border: 0;
            }
            :host{
                --element-color: #f2a72e;
                --background-color: transparent;
                --size: 1px;
				display: block;
                position:relative;
                width: 100%;
                height: 100%;
				cursor: pointer;
				background-color: var(--background-color);
            }
			fabs-split-view{
				position:relative;
                width: 100%;
                height: 100%;
			}
        </style>
		<fabs-split-view orientation="horizontal">
			<fabs-center-text></fabs-center-text>
			<fabs-add-button disabled></fabs-add-button>
		</fabs-split-view>
        `;
    }

    static get observedAttributes(){
        return ['color','backgroundcolor','style','disabled'];
    }

    attributeChangedCallback(name, oldValue, newValue){
        if(name == "color"){
            this.shadowRoot.host.style.setProperty('--element-color',newValue);
        }
        if(name == "backgroundcolor"){
            this.shadowRoot.host.style.setProperty('--background-color',newValue);
        }
        if(name == "style"){
			this.shadowRoot.querySelector('fabs-split-view').setAttribute('size',this.style.height);
			this.shadowRoot.querySelector('fabs-split-view').setAttribute('atend','');
        }
    }

	get disabled(){
		return this.hasAttribute('disabled');
	}

	set disabled(val){
		if (val) {
			this.shadowRoot.host.style.cursor = "default";
			this.setAttribute('disabled', '');
		} else {
			this.shadowRoot.host.style.cursor = "pointer";
			this.removeAttribute('disabled');
		}
	}

    connectedCallback(){
		this.addEventListener('click',(e) => {
			if(this.hasAttribute('disabled')) {
				console.log("addButton stopPropagation");
				//e.stopPropagation();
			}
		},true);
		this.shadowRoot.querySelector('fabs-center-text').innerHTML = this.innerHTML;
	}

	disconnectedCallback(){
	}

    // Métodos propios



    about(){
        var about = {
            "Description":"",
            "CreatedBy":"Fabián Doñaque",
            "Company":"Fabs Robotics",
            "CreatedOn":"Abr 2020",
            "ModifiedOn":"Abr 2020",
            "Methods":[],
            "Attributes":[]
        }
        return(about);
    }
}

class Button extends HTMLElement {
    // Métodos de clase
    constructor()
    {
        super();
        var shadow = this.attachShadow({mode: 'open'});
        shadow.innerHTML = `
        <style>
            *{
                margin: 0;
                padding: 0;
                border: 0;
            }
            :host{
                --element-color: #FFFFFF;
                --background-color: #140951;
                position:relative;
                display: flex;
                align-items: center;
                justify-content: center;
                width: auto;
                height: auto;
                overflow: hide;
                border-radius: 9999px;
                border-bottom:1px solid var(--background-color);
                background-color: var(--background-color);
                color: var(--element-color);
                appearance: none;
                cursor:pointer;
            }
            fabs{
                position:relative;
                diplay:block;
                padding: 0.4em 0.6em;
            }
        </style>
        <fabs>
            <slot>
                Button
            </slot>
        </fabs>
        `;
    }

    static get observedAttributes(){
        return ['callback','color','backgroundcolor'];
    }

    attributeChangedCallback(name, oldValue, newValue){
        if(name == "callback"){
            this.callback = newValue;
        }
        if(name == "color"){
            this.shadowRoot.host.style.setProperty('--element-color',newValue);
        }
        if(name == "backgroundcolor"){
            this.shadowRoot.host.style.setProperty('--background-color',newValue);
        }
    }

    connectedCallback(){
        /*this.addEventListener('click', e => {
            if(typeof this.callback === 'function'){
                this.callback(this);
            }
        });*/
    }

    // Métodos propios



    about(){
        var about = {
            "Description":"Elemento para crear un bontón redondeado, el onclick se ejecuta a traves del atributo callback.",
            "CreatedBy":"Fabián Doñaque",
            "Company":"Fabs Robotics",
            "CreatedOn":"Oct 2019",
            "ModifiedOn":"Oct 2019",
            "Methods":[],
            "Attributes":[
                {
                    'Name':'callback',
                    'Description': 'Sirve para asignar una función al onclick.'
                }
                ]
        }
        return(about);
    }
}

class CheckBox extends FabsElement {
	constructor(){
		super();
		this.about.parentClass = "FabsElement";
		this.about.description = "checkbox";
		this.about.createdOn = "2020-04-20";
		this.about.modifieOn = "2020-04-20";

		this.shadowRoot.innerHTML += `
		<style>
			:host {
				height: 1.9em;
				width: 3em;
			}
			#container {
				--border-width: 0.3em;
				position: absolute;
				top: 0;
				left: 0;
				width: calc(100% - 2 * var(--border-width) );
				height: calc(100% - 2 * var(--border-width) );
				cursor: pointer;
				background-color: #CFCFCF;
				border-style: inset;
				border-radius: 1.3em;
				border-color: #EFEFEF;
				border-width: var(--border-width);
				transition: background-color 0.4s;
			}

			#knob {
				position: absolute;
				top: 0;
				left: 0;
				background-color: white;
				border-radius: 1em;
				width: 1em;
				height: 1em;
				margin: 0.1em;
				transition: left 0.5s;
			}
		</style>
		<div id="container">
			<div id="knob"></div>
		</div>
		`;
	}
	connectedCallback(){
		this.addEventListener('click', e => {
			if(this.hasAttribute('on')) this.removeAttribute('on');
			else this.setAttribute('on','');
		});
	}

	static get observedAttributes(){
		return ['disabled','on'];
	}

	attributeChangedCallback(name, oldValue, newValue){
		//console.log("attributeChangedCallback",name);
		switch (name) {
			case "disabled":
				if(newValue) this.shadowRoot.getElementById('container').style.cursor = "default";
				else this.shadowRoot.getElementById('container').style.cursor = "pointer";
				break;
			case "on":
				//console.log("attribute on",newValue,oldValue);
				if(newValue != null){
					this.shadowRoot.getElementById('knob').style.left = "calc(100% - 1.2em)";
					this.shadowRoot.getElementById('container').style.backgroundColor = "#00FF50";
				} else {
					this.shadowRoot.getElementById('knob').style.left = "0";
					this.shadowRoot.getElementById('container').style.backgroundColor = "#CFCFCF";
				}
				this.dispatchEvent(new CustomEvent('fabs-change',{detail:this.hasAttribute('on')}));
				break;
			default:

		}
	}

	get disabled(){
		return this.hasAttribute('disabled');
	}

	set disabled(val){
		if (val) {
			this.shadowRoot.getElementById('container').style.cursor = "default";
			this.setAttribute('disabled', '');
		} else {
			this.shadowRoot.getElementById('container').style.cursor = "pointer";
			this.removeAttribute('disabled');
		}
	}

	get on(){
		return this.hasAttribute('on');
	}

	set on(val){
		if (val) {
			this.setAttribute('on', '');
		} else {
			this.removeAttribute('on');
		}
	}

}

//////////////
//  Inputs  //
//////////////

class FilterDateItem extends HTMLElement {
    // Class Methods
    constructor()
    {
        super();
        var shadow = this.attachShadow({mode: 'open'});
        shadow.innerHTML = `
        <style>
            *{
                margin: 0;
                padding: 0;
                border: 0;
            }
            :host{
                position:relative;
                display: block;
                width: 100%;
                height: auto;
                max-height:500px;
                overflow: scroll;
            }
            #container{
                position:relative;
                display: block;
                width: 100%;
                margin-top: 1em;
            }
            #titleBox{
                cursor:pointer;
            }
            #title{
                display:inline-block;
                margin-left: 0.5em;
            }
            #items{
                border-bottom:1px solid black;
            }
            .item{
                display:block;
                width:80%;
                margin:1em auto;
            }
            .right{
                display:inline-block;
                margin-left:1.05em;
                width: 0;
                height: 0;
                border-top: 0.4em solid transparent;
                border-bottom: 0.4em solid transparent;
                border-left: 0.4em solid black;
            }
            .down{
                display:inline-block;
                margin-left: 0.7em;
                width: 0;
                height: 0;
                border-left: 0.4em solid transparent;
                border-right: 0.4em solid transparent;
                border-top: 0.4em solid black;
            }
        </style>
        <div id="container">
            <div id="titleBox">
                <div id="triangle" class="down"></div>
                <p id="title">Rango de fechas:</P>
            </div>
            <div id='items'>
                <input type="date" id="begin" class="item"/>
                <input type="date" id="end" class="item"/>
            </div>
        </div>
        `;
    }

    connectedCallback(){
        let triangle = this.shadowRoot.getElementById('triangle');
        let titleBox = this.shadowRoot.getElementById('titleBox');
        titleBox.addEventListener('click', e => {
            if(triangle.className == "right"){
                triangle.className = "down";
                this.shadowRoot.getElementById('items').style.display = 'block';
            }
            else{
                triangle.className = "right";
                this.shadowRoot.getElementById('items').style.display = 'none';
            }
        });
    }


    // Custom Methods

    setConfiguration(data){
        this.name = data.name;
        this.tableAssociated = data.tableAssociated;
        this.shadowRoot.getElementById('title').innerHTML = data.title;
        this.shadowRoot.getElementById('begin').value = data.elements[0];
        this.shadowRoot.getElementById('end').value = data.elements[1];
    }

    getItemResult(){
        let begin = this.shadowRoot.querySelector("#begin").value;
        let end = this.shadowRoot.querySelector("#end").value;
        return this.tableAssociated+"."+this.name+" BETWEEN '"+begin+"' AND '"+end+"'";
    }

    about(){
        var about = {
            "Description":"Elemento para crear un filtro de fecha. Se inicia con la fecha actual y la de un mes anterior.",
            "CreatedBy":"Fabián Doñaque",
            "Company":"Fabs Robotics",
            "CreatedOn":"Sept 2019",
            "ModifiedOn":"Oct 2019",
            "Methods":[
                {
                    'Name':'getItemResult()',
                    'Description':'Devuelve el resultado de los campos date en un string con formato MYSQL',
                    'Return':'BETWEEN date1 AND date2'
                }
                ],
            "Attributes":[]
        }
        return(about);
    }
}

class FilterElementsItem extends HTMLElement {
    // Class Methods
    constructor()
    {
        super();
        var shadow = this.attachShadow({mode: 'open'});
        shadow.innerHTML = `
        <style>
            *{
                margin: 0;
                padding: 0;
                border: 0;
            }
            :host{
                position:relative;
                display: block;
                width: 100%;
            }
            #container{
                position:relative;
                display: block;
                width: 100%;
                margin-top: 1em;
            }
            #titleBox{
                cursor:pointer;
            }
            #items{
                display:block;
                width:100%;
                height: auto;
                max-height:300px;
                overflow: scroll;
                border-bottom:1px solid black;
            }
            .item{
                display:block;
                width:100%;
                cursor:pointer;
            }
            .item input{
                margin-right:1em;
                margin-left:1em;
            }
            #title{
                display:inline-block;
                margin-left: 0.5em;
            }
            .right{
                display:inline-block;
                margin-left:1.05em;
                width: 0;
                height: 0;
                border-top: 0.4em solid transparent;
                border-bottom: 0.4em solid transparent;
                border-left: 0.4em solid black;
            }
            .down{
                display:inline-block;
                margin-left:0.7em;
                width: 0;
                height: 0;
                border-left: 0.4em solid transparent;
                border-right: 0.4em solid transparent;
                border-top: 0.4em solid black;
            }
        </style>
        <div id="container">
            <div id="titleBox">
                <div id="triangle" class="down"></div>
                <p id="title">Filtrar por elemento:</P>
            </div>
            <label class="item" id="selectAll">
                <input type="checkbox" id="first" checked/>Todos
            </label>
            <div id="items"></div>
        </div>
        `;
    }

    connectedCallback(){
        let first = this.shadowRoot.querySelector("#first");
        first.addEventListener('change', e => this.checkChecked(e.target));
        let triangle = this.shadowRoot.getElementById('triangle');
        let titleBox = this.shadowRoot.getElementById('titleBox');
        titleBox.addEventListener('click', e => {
            if(triangle.className == "right"){
                triangle.className = "down";
                this.shadowRoot.getElementById('selectAll').style.display = 'block';
                this.shadowRoot.getElementById('items').style.display = 'block';
            }
            else{
                triangle.className = "right";
                this.shadowRoot.getElementById('selectAll').style.display = 'none';
                this.shadowRoot.getElementById('items').style.display = 'none';
            }
        });
    }

    // Custom Methods

    setConfiguration(data){
        this.entityName = data.entityName;
        this.entityId = data.entityId;
        this.shadowRoot.getElementById('title').innerHTML = data.entityName;
        data.elements.forEach(function(element) {
            var itemCheckbox = document.createElement('input');
            let itemLabel = document.createElement('label');


            itemCheckbox.type = 'checkbox';
            itemCheckbox.id = element.id;
            itemLabel.addEventListener('change', e => this.checkChecked(e.target));
            itemLabel.className="item";
            itemLabel.appendChild(itemCheckbox);
            itemLabel.innerHTML += element.value;

            this.shadowRoot.getElementById('items').appendChild(itemLabel);
        },this);
    }

    checkChecked(element){
        if(element.id == "first"){
            let inputs = this.shadowRoot.querySelectorAll("input");
            inputs.forEach(function(input){
                input.checked = false;
            },this);
            element.checked = true;
        } else {
            var isFirstChecked = true;
            let inputs = this.shadowRoot.querySelectorAll("input");
            inputs.forEach(function(input){
                if(input.checked) isFirstChecked = false;
            },this);
            this.shadowRoot.querySelector("#first").checked = isFirstChecked;
        }
    }

    getItemResult(){
        if(!this.shadowRoot.querySelector("#first").checked){
			var data = [];
            let inputs = this.shadowRoot.querySelectorAll("input");
            inputs.forEach(function(input){
                if(input.checked) data.push(input.id);
            },this);

            var final = {'id':this.entityId,'data':data};
            return final;
        } else {
			return "";
		}
    }

    about(){
        var about = {
            "Description":"Elemento para crear un filtro por elemento. Hay que usar el método setItemElements() para dotarlo de contenido.",
            "CreatedBy":"Fabián Doñaque",
            "Company":"Fabs Robotics",
            "CreatedOn":"Oct 2019",
            "ModifiedOn":"Oct 2019",
            "Methods":[
                {
                    'Name':'getItemResult()',
                    'Description':'Si Select All está desactivado, devuelve un string, con formato MYSQL, con todos los valores seleccionados',
                    'Return':'element IN (elements...)'
                },
                {
                    'Name':'setItemElements()',
                    'Description':'Introduce los elementos por los que se desea filtrar. El formato es un array json en el que cada elemento tiene "id" y "name".',
                    'Return':'null'
                }
                ],
            "Attributes":[]
        }
        return(about);
    }
}

class FilterView extends HTMLElement {
    // Class methods
    constructor()
    {
        super();
        var shadow = this.attachShadow({mode: 'open'});
        shadow.innerHTML = `
        <style>
            *{
                margin: 0;
                padding: 0;
                border: 0;
            }
            :host{
                display: block;
                position:relative;
                width: 100%;
                height: 100%;
                overflow: hidden;
            }
            #top{
                position:relative;
                display:flex;
                align-items: center;
                justify-content: center;
                width:100%;
                height:5em;
                border-bottom: 1px solid black;
            }
            #filters{
                position:relative;
                width: 100%;
                height: calc( 100% - 10em );
                overflow:scroll;
            }

            #bottom{
                position:relative;
                display:flex;
                align-items: center;
                justify-content: center;
                width:100%;
                height:5em;
            }

        </style>
        <div id="top">Filtro</div>
        <div id="filters">
            <slot></slot>
        </div>
        <div id="bottom">
            <fabs-button id="filter">
                Filtrar
            </fabs-button>
        </div>
        `;
    }


    connectedCallback(){
        let filter = this.shadowRoot.querySelector("#filter");
        filter.addEventListener('click', e => this.callback(this.getFilters()));
    }

    // Custom Methods

    getFilters(){
        var filterItems = this.children;
        var filters = [];
        for (let item of filterItems){
            if(item.tagName == "FABS-FILTER-DATE-ITEM" || item.tagName == "FABS-FILTER-ELEMENTS-ITEM"){
                let filterResult = item.getItemResult();
                if(filterResult !== "") filters.push(filterResult);
            }
        }
        return filters;
    }

    setCallback(callback){
        this.callback = callback;
    }

    about(){
        var about = {
            "Description":"Elemento para crear una vista para filtros",
            "CreatedBy":"Fabián Doñaque",
            "Company":"Fabs Robotics",
            "CreatedOn":"Sept 2019",
            "ModifiedOn":"Sept 2019",
            "Methods":[
                {
                    "Name":"getFilters()",
                    "Description":"Devuelve un string en formato MYSQL con todos los filtros.",
                    "Return":"Depende de los filtros, mirarlos de forma individual."
                }
                ],
            "Attributes":[{
                "Name":"callback",
                "Description":"Sirve para asignar una función callback al seleccionar un item."
            }]
        }
        return(about);
    }
}

class InputText extends FabsElement {
	constructor(){
		super();
		this.about.parentClass = "FabsElement";
		this.about.description = "Elemento para crear un campo de texto.";
		this.about.createdOn = "2019-10-01";
		this.about.modifieOn = "2020-04-19";
		this.about.attributes.push(new ElementAttribute("size","size string","Modifica el tamaño de la fuente"));
		this.about.attributes.push(new ElementAttribute("placeholder","string","placeholder"));
		this.about.attributes.push(new ElementAttribute("password","bool","Cambia el texto por asteriscos"));
		this.about.attributes.push(new ElementAttribute("readonly","bool","deshabilita la escritura"));
		this.about.attributes.push(new ElementAttribute("color","color string","cambia el color de la fuente"));
		this.about.attributes.push(new ElementAttribute("label","string","Introduce una etiqueta a la izquierda"));
		this.about.attributes.push(new ElementAttribute("underline","bool","Subraya el campo de texto"));
		this.about.events.push(new ElementEvent("endEditing","object","Se activa cuando el objeto pierde foco, devuelve el último valor."));
		this.about.events.push(new ElementEvent("cancelEditing","null","Se activa cuando el usuario cancela la edición con esc."));
		this.shadowRoot.innerHTML += `
			<style>
				:host{
					--element-color: #FFFFFF;
					--element-padding: 1em;
					height: auto;
					overflow: hide;
					color: var(--element-color);
				}
				::placeholder {
					color: var(--element-color);
					opacity: 0.6;
				}
				#wrapper{
					position:relative;
					display:flex;
					flex-direction:row;
					width: calc( 100% - var(--element-padding) );
				}
				#label{
					display:none;
				}
				input{
					flex: 1;
					height: auto;
					border-radius: 0;
					appearance: none;
					background: none;
					outline: none;
					padding-left: var(--element-padding);
					color: inherit;
					font-family: inherit;
					font-size: inherit;
				}
			</style>
			<div id="wrapper">
				<span id="label"></span>
				<input type="text" placeholder="Text" id="text"/>
			</div>
		`;
	}

	static get observedAttributes(){
		return ['size','placeholder','password','readonly','color','label','underline','number'];
	}

	attributeChangedCallback(name, oldValue, newValue){
		switch (name) {
			case "size":
				this.shadowRoot.getElementById('text').style.fontSize = newValue;
				break;
			case "placeholder":
				this.shadowRoot.getElementById('text').placeholder = newValue;
				break;
			case "password":
				this.shadowRoot.getElementById('text').type = "password";
				break;
			case "number":
				this.shadowRoot.getElementById('text').type = "number";
				break;
			case "readonly":
				this.shadowRoot.getElementById('text').readOnly = true;
				break;
			case "color":
				this.shadowRoot.host.style.setProperty('--element-color',newValue);
				break;
			case "label":
				var label = this.shadowRoot.getElementById('label');
				label.innerHTML = newValue+": ";
				label.style.display = 'inline';
				break;
			case "underline":
				this.shadowRoot.querySelector('#text').style.borderBottom = '1px solid var(--element-color)';
				break;

		}
	}

	connectedCallback(){
		const input = this.shadowRoot.getElementById('text');
		input.addEventListener('keydown', event => {
			switch (event.keyCode) {
				case 27:
					event.stopPropagation();
					this.dispatchEvent(new CustomEvent('cancelEditing',{detail:input.value}));
					input.value = "";
					input.blur();
					break;
				case 13:
					this.dispatchEvent(new CustomEvent('endEditing',{detail:input.value}));
					input.blur();
					break;
			}
		});
		input.addEventListener('keyup', e => {
			if(input.value == "") this.dispatchEvent(new CustomEvent('inputEmpty',{detail:""}));
			if(this.number && !['0','1','2','3','4','5','6','7','8','9'].includes(e.key)){
				input.value = input.value.substring(0, input.value.length - 1);
			}
		});
	}

	get value(){
		return this.shadowRoot.getElementById('text').value;
	}

	set value(val){
		this.shadowRoot.getElementById('text').value = val;
	}

	setPlaceholder(val){
		this.shadowRoot.getElementById('text').setAttribute('placeholder',val);
	}

	focus(){
		//console.log("focus");
		this.shadowRoot.getElementById('text').focus();
	}

	get number(){
		return this.hasAttribute('number');
	}

	set number(value){
		if(value) this.setAttribute('number','');
		else this.removeAttribute('number');
	}
}

class ListView extends FabsElement {
	constructor() {
		super();
		this.about.parentClass = "FabsElement";
		this.about.description = "Elemento para hacer listas";
		this.about.createdOn = "2019-09-01";
		this.about.createdOn = "2020-04-19";
		this.about.methods.push(new ElementMethod("setContent","array","null","Con este método se le pasa la información a la lista, los argumentos son: ([{'id': (int o string)id, 'name': (string)'text0'},{'id': (int o string)id, 'name': (string)'text1'},...]"));
		this.about.methods.push(new ElementMethod("setFirstSelected","null","null","Con este método haces que el primer elemento esté elegido y lanze la función asociada al atributo callback"));
		this.about.events.push(new ElementEvent("itemSelected","object","Devuelve el objecto seleccionado."));
		this.shadowRoot.innerHTML += `
			<style>
				:host{
					--element-color: black;
					--selected-color: black;
					--hover-color: black;
					--element-background: transparent;
					--selected-background: #f2a72e;
					--hover-background: #f2a72e;
					--element-height: 3em;
					--element-padding: 1em;
					overflow: scroll;
				}
				ul{
					width: 100%;
					list-style-type: none;
				}
				li{
					width: 100%;
					height: var(--element-height);
					line-height: var(--element-height);
					padding-left: var(--element-padding);
					background-color: var(--element-background);
					color: var(--element-color);
				}
				li:hover{
					background-color: var(--hover-background);
					color: var(--hover-color);
					cursor:pointer;
				}
				.selected{
					background-color: var(--selected-background);
					color: var(--selected-color);
				}
			</style>
			<ul id="ul"></ul>
		`;
	}

	static get observedAttributes(){
		return ['callback','separator','color','hovercolor','selectedcolor','backgroundcolor','backgroundhover','backgroundselected'];
	}

	attributeChangedCallback(name, oldValue, newValue){
		if(this.hasAttribute('separator')){
			var newStyle = document.createElement('STYLE');
			newStyle.innerHTML = `
				li{
					border-bottom: 1px solid black;
				}
			`;
			this.shadowRoot.appendChild(newStyle);
		}
		if(name == "callback"){
			this.callback = newValue;
		}
		if(name == "color"){
			this.shadowRoot.host.style.setProperty('--element-color',newValue);
		}
		if(name == "hovercolor"){
			this.shadowRoot.host.style.setProperty('--hover-color',newValue);
		}
		if(name == "selectedcolor"){
			this.shadowRoot.host.style.setProperty('--selected-color',newValue);
		}
		if(name == "backgroundcolor"){
			this.shadowRoot.host.style.setProperty('--element-background',newValue);
		}
		if(name == "backgroundhover"){
			this.shadowRoot.host.style.setProperty('--hover-background',newValue);
		}
		if(name == "backgroundselected"){
			this.shadowRoot.host.style.setProperty('--selected-background',newValue);
		}
	}

	get separator(){
		return this.hasAttribute('separator');
	}

	set separator(value){
		if(value) this.setAttribute('separator','');
		else this.removeAttribute('separator');
	}

	setContent(list){
		var ul = this.shadowRoot.querySelector('#ul');
		ul.innerHTML = "";
		list.forEach(function(item) {
			var element = document.createElement('LI');
			element.id = item.id;
			element.innerHTML = item.name;
			element.addEventListener('click', e => this.doAction(e.target));
			ul.appendChild(element);
		},this);
	}

	doAction(element){
		const lis = this.shadowRoot.querySelectorAll("li");
		lis.forEach(function(item){
			item.classList.remove("selected");
		});
		element.classList.add("selected");
		this.dispatchEvent(new CustomEvent("itemSelected",{detail:{id:element.id,value:element.innerHTML}}));
	}

	setFirstSelected(){
		this.doAction(this.shadowRoot.querySelector('#ul').firstChild);
	}

	clear(){
		this.shadowRoot.querySelector('#ul').innerHTML = "";
	}
}

class Navbar extends HTMLElement {
    constructor()
    {
        super();

        var shadow = this.attachShadow({mode: 'open'});
        shadow.innerHTML = `
        <style>
            *{
                margin:0;
                padding:0;
                border:0;
            }
            :host{
                --element-color: black;
                --background-color: transparent;
                width: 100%;
                height: 100%;
                display:block;
                color: var(--element-color);
                background-color: var(--background-color);
            }
            #first{
                width: 25%;
                height: 100%;
                float:left;
                display:flex;
                align-items: center;
                justify-content:flex-start;
            }
            #second{
                width: 50%;
                height: 100%;
                float:left;
				font-size:200%;
				fond-weight: bold;
                display:flex;
                align-items: center;
                justify-content:center;
            }
            #third{
                height: 100%;
                width:25%;
                float:left;
                display:flex;
                align-items: center;
                justify-content:flex-end;
            }
        </style>
        <div id="first">
            <slot name="left"></slot>
        </div>
        <div id="second"></div>
        <div id="third">
            <slot name="right"></slot>
        </div>
        `;
    }

    static get observedAttributes(){
        return ['title','color','backgroundcolor'];
    }

    attributeChangedCallback(name, oldValue, newValue){
        if(name == 'title'){
            if(newValue !== "" && newValue){
                let title = this.shadowRoot.querySelector('#second');
                title.innerHTML = newValue;
            }
        }
        if(name == 'color'){
            this.shadowRoot.host.style.setProperty('--element-color',newValue);
        }
        if(name == 'backgroundcolor'){
            this.shadowRoot.host.style.setProperty('--background-color',newValue);
        }
    }

    about(){
        var about = {
            "Description":"Elemento para hacer barras de navegación",
            "CreatedBy":"Fabián Doñaque",
            "Company":"Fabs Robotics",
            "CreatedOn":"Sept 2019",
            "ModifiedOn":"Sept 2019",
            "Methods":[],
            "Attributes":[{
                "Name":"title",
                "Description":"Sirve para asignar un título a la barra de navegación."
            }]
        }
        return(about);
    }
}

class PopupView extends FabsElement {
	constructor(){
		super();
		this.about.parentClass = "FabsComponent";
		this.about.description = "Elemento para bloquear la pantalla con un elemento central";
		this.about.createdOn = "2019-09-01";
		this.about.createdOn = "2020-04-17";
		this.shadowRoot.innerHTML += `
			<style>
				:host{
					z-index: 500;
				}
				#wrapper{
					width: 100%;
					height: 100%;
					display: flex;
					align-items: center;
					justify-content: center;
					background-color: rgba(180, 180, 180, 0.5);
				}
				#innerBox{
					width:50%;
					height:50%;
					border-radius: 2em;
					padding: 2em;
					z-index: 501;
					opacity: 1;
					background-color: white;
					overflow: hidden;
				}
			</style>
			<div id="wrapper">
				<div id="innerBox">
					<slot></slot>
				</div>
			<div>
		`;


	}

	connectedCallback(){
		this.addEventListener("LightDOMChanged", e => {
			//console.log("popup LightDOMChanged",e.detail.addedNodes[0].getBoundingClientRect().width);

		});
		let popupRemoved = new Event('popupRemoved');
		/*this.addEventListener("keydown", event => {
			console.log('popup');
			if (event.keyCode === 27) {
				console.log("popup");
				this.dispatchEvent(popupRemoved);
				this.remove();
			}
		});*/
		/*this.shadowRoot.querySelector('#wrapper').addEventListener('click', e => {
			if(e.target.id === "wrapper"){
				this.dispatchEvent(popupRemoved);
				this.remove();
			}
		});*/

	}
}

class SplitView extends View {

	get size(){	return this.getAttribute('size');}

	set size(val){
		if (val) this.setAttribute('size', val);
		else this.removeAttribute('size');
	}

	get separator(){ return this.getAttribute('separator');}

	set separator(val){
		if (val) this.setAttribute('separator', val);
		else this.removeAttribute('separator');
	}

	get orientation(){	return this.getAttribute('orientation');}

	set orientation(val){
		if (val) this.setAttribute('orientation', val);
		else this.removeAttribute('orientation');
	}

	get atend(){	return this.getAttribute('atend');}

	set atend(val){
		if (val) this.setAttribute('atend', val);
		else this.removeAttribute('atend');
	}

	constructor()
	{
		super();
		this.about.description = "Elemento SplitView, ocupa el 100% del espacio disponible, divide la pantalla en dos y recorta el contenido que se salga.";
		this.about.createdOn = "2019-09-01";
		this.about.modifiedOn = "2020-04-17";
		this.about.attributes = [
			{
				"Name":"atend",
				"Description":"Define si el tamaño es del primer elemento o del segundo en Light DOM."
			},
			{
				"Name":"size",
				"Description":"Define el tamaño del primer element en Light DOM."
			},
			{
				"Name":"orientation",
				"Description":"Define si se divide la pantalla en vertical o en horizontal, por defecto está en vertical."
			},
			{
				"Name":"separator",
				"Description":"Define si lleva una línea negra de 1 pixel en la división."
			}
		];
	}

	connectedCallback() {
		if(!this.hasAttribute('orientation')) this.orientation = 'vertical';
		if(!this.hasAttribute('size')) this.size = '50%';
		this.setContent();
	}

	static get observedAttributes() {
		return ['size','separator','orientation','atend'];
	}

	attributeChangedCallback(name, oldValue, newValue){
		this.setContent();
	}

	setContent() {
		let len = this.children.length;
		if(len > 1){
			this.children[0].style.position = "relative";
			this.children[1].style.position = "relative";

			if(this.orientation == "vertical"){
				this.children[0].style.width = "100%";
				this.children[1].style.width = "100%";
				if(this.hasAttribute('atend')){
					if(this.hasAttribute('separator')){
						this.children[0].style.height = "calc( 100% - "+this.size+" - 1px)";
						this.children[0].style.borderBottom = "1px solid black";
						this.children[1].style.height = this.size;
					} else {
						this.children[0].style.height = "calc( 100% - "+this.size+" )";
						this.children[1].style.height = this.size;
					}
				} else {
					if(this.hasAttribute('separator')){
						this.children[0].style.height = this.size;
						this.children[0].style.borderBottom = "1px solid black";
						this.children[1].style.height = "calc( 100% - "+this.size+" - 1px)";
					} else {
						this.children[0].style.height = this.size;
						this.children[1].style.height = "calc( 100% - "+this.size+" )";
					}
				}
			} else {

				this.children[0].style.float = "left";
				this.children[0].style.height = "100%";
				this.children[1].style.float = "left";
				this.children[1].style.height = "100%";

				if(this.hasAttribute('atend')){
					if(this.hasAttribute('separator')){
						this.children[0].style.width = "calc( 100% - "+this.size+" - 1px)";
						this.children[0].style.borderRight = "1px solid black";
						this.children[1].style.width = this.size;
					} else {
						this.children[0].style.width = "calc( 100% - "+this.size+" )";
						this.children[1].style.width = this.size;
					}
				} else {
					if(this.hasAttribute('separator')){
						this.children[0].style.width = this.size;
						this.children[0].style.borderRight = "1px solid black";
						this.children[1].style.width = "calc( 100% - "+this.size+" - 1px)";
					} else {
						this.children[0].style.width = this.size;
						this.children[1].style.width = "calc( 100% - "+this.size+" )";
					}
				}
			}
		}

		if (len > 2){
			for(let i = 2; i< len; i++){
				this.children[i].style.display = "none";
			}
		}
	}
}

class TableView extends HTMLElement {
    // Classs Methods
    constructor()
    {
        super();
        var shadow = this.attachShadow({mode: 'open'});
        shadow.innerHTML = `
        <style id="style">
            *{
                margin: 0;
                padding: 0;
                border: 0;
            }
            :host{
                --element-color: black;
                --element-background-color: transparent;
                --element-hover-color: black;
                --element-hover-background-color: #f2a72e;

                display: block;
                position:relative;
                width: 100%;
                height: 100%;
            }

            #container{
                display: block;
                position:absolute;
                width: 100%;
                height: 100%;
            }

                #table{
                    display: block;
                    position:relative;
                    margin: 2em 2em 0 2em;
                    width: calc( 100% - 4em );
                    height: calc( 100% - 2em );
                }

                    #head{
                        display: flex;
                        position:relative;
                        width: 100%;
                        height: 1em;
                        font-weight: bold;
                        border-bottom: 1px solid var(--element-color);
                    }

                    #body{
                        display: block;
                        position:relative;
                        width: 100%;
                        height: calc( 100% - 1em );
                        overflow: scroll;
                    }
                        .row{
                            display: flex;
                            position: relative;
                            width: 100%;
                            cursor: default;
                            color: var(--element-color);
                        }
                        .row:hover{
                            background-color: var(--element-hover-background-color);
                            color: var(--element-hover-color);
                        }
        </style>
        <fabs id="container">
            <fabs id="table">
                <fabs id="head">
                </fabs>
                <fabs id="body">
                </fabs>
            </fabs>
        </fabs>
        `;
    }

    static get observedAttributes(){
        return ['callback','headers','content','autoheight','color','background','hovercolor','hoverbackground'];
    }

    attributeChangedCallback(name, oldValue, newValue){
        if(name == "callback"){
            this.selectedCallback = newValue;
            this.setSelectedCallback();
        }
        if(name == "headers"){
            this.headersArray = newValue;
            this.setHeaders();
        }
        if(name == "content"){
            this.contentArray = newValue;
            this.setContent();
        }
        if(name == "autoheight"){
            this.shadowRoot.host.style.height = 'auto';
            this.shadowRoot.getElementById('container').style.height = 'auto';
            this.shadowRoot.getElementById('table').style.height = 'auto';
            this.shadowRoot.getElementById('body').style.height = 'auto';
            console.log(this.shadowRoot);
        }
		if(name == "color"){
            this.shadowRoot.host.style.setProperty('--element-color',newValue);
        }
		if(name == "background"){
            this.shadowRoot.host.style.setProperty('--element-background-color',newValue);
        }
		if(name == "hovercolor"){
            this.shadowRoot.host.style.setProperty('--element-hover-color',newValue);
        }
		if(name == "hoverbackground"){
            this.shadowRoot.host.style.setProperty('--element-hover-background-color',newValue);
        }
    }

    // Setter/Getter Attributes Mehtods

    get callback(){
        return this.selectedCallback;
    }

    set callback(value){
        this.selectedCallback = value;
        this.setSelectedCallback();
    }

    get headers(){
        return this.headersArray;
    }

    set headers(value){
        this.headersArray = value;
        this.setHeaders();
    }

    get content(){
        return this.contentArray;
    }

    set content(value){
        this.contentArray = value;
        this.setContent();
    }

    // Custom Methods
    setSelectedCallback(){
        if(this.selectedCallback){
            this.shadowRoot.getElementById('style').innerHTML += `
                .row{
                    cursor: pointer;
                }
            `;
        } else {
            this.shadowRoot.getElementById('style').innerHTML += `
                .row{
                    cursor: default;
                }
            `;
        }
    }

    setHeaders(){
        if(this.headersArray){
            var len = this.headersArray.length;
            var head = this.shadowRoot.getElementById('head');
            this.headersArray.forEach(function(col){
                var cellHeader = document.createElement('DIV');
                cellHeader.innerHTML = col;
                cellHeader.style.textAlign = "center";
                cellHeader.style.width = "calc( 100% / "+len+" )"
                head.appendChild(cellHeader);
            });
        }
    }

    appendContent(){
        var body = this.shadowRoot.getElementById('body');
        this.contentArray.forEach(function(row) {
            var len = row.data.length;
            var newRow = document.createElement('DIV');
            row.data.forEach(function(col){
                var cell = document.createElement('DIV');
                cell.innerHTML = col.value;
                if(col.id) cell.id = col.id;
                cell.style.textAlign = "left";
                cell.style.paddingLeft = "1em";
                cell.style.width = "calc( 100% / "+len+" )";
                newRow.appendChild(cell);
            },this);
            newRow.onclick = e => {this.getRow(e,this);};
            newRow.className = "row";
            newRow.id = row.id;
            body.appendChild(newRow);
        },this);
    }

    setContent(){
        var body = this.shadowRoot.getElementById('body');
        body.innerHTML = "";
        this.appendContent();
    }

    getRow(event,host){
        var row = event.target.parentElement;
        if(row.className === 'row'){
            var id = row.id;
            var values = [];
            for(var cell of row.children){
                values.push({'id':cell.id, 'value':cell.innerHTML});
            }
            var result = {'id':id,'values':values};
            if(host.selectedCallback) host.selectedCallback(result);
        }
    }

    about(){
        var about = {
            "description":"Elemento para hacer tablas. Una tabla necesita saber:\n1.- Los headers.\n2.- Los identificadores de fila.\n3.- Los datos de la fila.\n4.- La función a la que llamar cuando se clicke una fila.",
            "createdBy":"Fabián Doñaque",
            "company":"Fabs Robotics",
            "createdOn":"Sept 2019",
            "modifiedOn":"Oct 2019",
            "methods":[{
                "name":"setFullContent",
                "description":"Con este método se le pasa la información a la tabla, los argumentos son: ((bool) header, [{'id': (int o string)id, 'data': [(string)'text0',(string)'texto1',...]},{'id': (int o string)id, 'data': [(string)'text0',(string)'texto1',...]},...]",
                "return": "null"
            },{
                "name":"setHeader",
                "description":"Con este método se le pasa el header a la tabla y se elimina todo el contenido previo, se le pasa un array con los nombres",
                "return": "null"
            },{
                "name":"appendContent",
                "description":"Con este método se añade contenido a la tabla, los argumentos son: {'id': (int o string)id, 'data': [(string)'text0',(string)'texto1',...]}",
                "return": "null"
            }],
            "attributes":[
                {
                    "name":"headers",
                    "description": "En este atributo se guardan las cabeceras de la tabla en un array."
                },{
                    "name":"callback",
                    "description":"En este atributo se almacena la función de llamada para cuando se clicke una fila. Si está definida aparecerá una mano encima de las filas, y si no, una flecha."
                }
            ]
        }
        return(about);
    }
}

class ValidatedInput extends FabsElement {
	constructor()
	{
		super();
		//console.log("validatedInput constructor",this.getBoundingClientRect().width);
		this.about.parentClass = "FabsComponent";
		this.about.createdOn = "2020-04-17";
		this.about.createdOn = "2020-04-17";

		this.states = {
			initial: 0,
			selecting: 1,
			selected: 2,
			new: 3
		}
		this.listContent = [];
		this.state = this.states.initial;
		this.shadowRoot.innerHTML += `
			<style>
				:host {
					overflow: visible;
				}
				#container {
					position: relative;
					top: calc( ( 100% - 1.9em ) / 2);
					left: 0.3em;
					height: 1.9em;
					width: calc( 100% - 0.6em );
					overflow: visible;
					z-index: 100;
				}
				#bubble {
					--border-width: 0.3em;
					--padding-size: 0.6em;
					width: calc( 100% - 2 * var(--border-width) - 2 * var(--padding-size) );
					height: calc( 100% - 2 * var(--border-width) );
					padding: 0 var(--padding-size);
					border-style: inset;
					border-radius: 1em;
					border-color: #EFEFEF;
					border-width: var(--border-width);
					transition: height 0.8s;
					background-color: white;

				}
			</style>
			<div id="container">
				<div id="bubble">
					<fabs-split-view size="1.3em" separator>
						<fabs-split-view orientation="horizontal" size="2em" atend>
							<fabs-input-text color="black" id="input" placeholder="Referencia"></fabs-input-text>
							<fabs-button-symbol id="actionButton" symbol="downArrow" color="var(--fabs-color)"></fabs-button-symbol>
						</fabs-split-view>
						<fabs-list-view id="list" style="--element-height:1.9em;"></fabs-list-view>
					</fabs-split-view>
				</div>
			</div>
		`;
	}

	connectedCallback(){
		const input = this.shadowRoot.querySelector('#input');
		const list = this.shadowRoot.querySelector('#list');
		const button = this.shadowRoot.querySelector('#actionButton');
		const bubble = this.shadowRoot.querySelector('#bubble');

		input.style.setProperty("--element-padding","0");
		list.style.setProperty("--element-padding","0");

		button.addEventListener('click', e => {
			//console.log('button listener',this.state);
			switch (this.state) {
				case this.states.initial:
					list.setContent(this.listContent);
					this.amountOfItems = this.listContent.length;
					this.setState(this.states.selecting);
					break;
				case this.states.selecting:
					this.setState(this.states.initial)
					break;
				case this.states.selected:
					this.dispatchEvent(new CustomEvent('itemSelected',{detail:this.selectedItem}));
					input.value = "";
					this.setState(this.states.initial)
					break;
				case this.states.new:
					this.dispatchEvent(new CustomEvent('newItem',{detail:{name:input.value}}));
					input.value = "";
					this.setState(this.states.initial)
					break;
			}
		});
		this.checkItem("");
		list.addEventListener('itemSelected', e => {
			input.value = e.detail.value;
			this.setState(this.states.selected);
		});
		input.addEventListener('blur', e => {
			if(this.state == this.states.selecting) this.setState(this.states.initial);
		});

		input.addEventListener('input', e => {
			if(this.checkItem(input.value)) this.setState(this.states.selected);
			else this.setState(this.states.new);
		});
		input.addEventListener('inputEmpty', e => {
			this.setState(this.states.selecting);
		});
		input.addEventListener('cancelEditing', e => {
			this.setState(this.states.initial);
		});
		input.addEventListener('endEditing', e => {
			if(this.state == this.states.new){
				this.dispatchEvent(new CustomEvent('newItem',{detail:{name:input.value}}));
				input.value = "";
				this.setState(this.states.initial)
			} else if (this.state == this.states.selected){
				this.dispatchEvent(new CustomEvent('itemSelected',{detail:this.selectedItem}));
				input.value = "";
				this.setState(this.states.initial);
			}
		});
	}

	setContent(content){
		this.listContent = content;
		this.shadowRoot.querySelector('#list').setContent(content);
	}

	checkItem(item){
		let value = item;
		if(typeof(value) === 'number') value = item.toString();
		const list = this.shadowRoot.querySelector('#list');
		let actualContent = [];
		let found = false;
		this.amountOfItems = 0;
		for(let i in this.listContent){
			let listItem = this.listContent[i].name;
			if(typeof(listItem) === 'number') listItem = listItem.toString();
			if(listItem.startsWith(value)){
				this.amountOfItems += 1;
				actualContent.push(this.listContent[i]);
			}
			if(listItem === value) {
				found = true;
				this.selectedItem = this.listContent[i];
			}
		}
		list.setContent(actualContent);
		return found;
	}

	setState(state){
		this.state = state;
		const input = this.shadowRoot.querySelector('#input');
		const list = this.shadowRoot.querySelector('#list');
		const button = this.shadowRoot.querySelector('#actionButton');
		const bubble = this.shadowRoot.querySelector('#bubble');

		let hsize = 1.9*this.amountOfItems+1.2;
		if(hsize>14.6) hsize = 14.6;

		switch (state) {
			case this.states.initial:
				//console.log("initial");
				bubble.style.height = "calc( 100% - 2 * var(--border-width) )";
				button.symbol = 'downArrow';
				button.color = 'var(--fabs-color)';
				break;
			case this.states.selecting:
				//console.log("selecting");
				bubble.style.height = `calc(${hsize}em + 1px)`;
				button.symbol = 'downArrow';
				button.color = 'black';
				input.focus();
				break;
			case this.states.selected:
				//console.log("selected");
				bubble.style.height = "calc( 100% - 2 * var(--border-width) )";
				button.symbol = "checkMark";
				button.color = 'green';
				break;
			case this.states.new:
				//console.log("new");
				bubble.style.height = `calc(${hsize}em + 1px)`;
				button.symbol = "cross";
				button.color = 'var(--fabs-color)';
				break;
		}
	}

	static get observedAttributes(){
		return ['style','number'];
	}

	attributeChangedCallback(name, oldValue, newValue){
		const view = this.shadowRoot.querySelector('#bubble');
		if(name === 'number'){
			this.shadowRoot.querySelector('#input').number = true;
			console.log("number activado.");
		}
	}

	set number(value){
		if(value) this.setAttribute('number','');
		else this.removeAttribute('number');
	}

	get number(){
		return this.hasAttribute('number');
	}
}


///////////////
//  Defines  //
///////////////

customElements.define('fabs-add-button', AddButton);
customElements.define('fabs-option-button', OptionButton);
customElements.define('fabs-add-labeled-button', AddLabeledButton);
customElements.define('fabs-button', Button);
customElements.define('fabs-center-text', CenterText);
customElements.define('fabs-center-view', CenterView);
customElements.define('fabs-filter-date-item', FilterDateItem);
customElements.define('fabs-filter-elements-item', FilterElementsItem);
customElements.define('fabs-filter-view', FilterView);
customElements.define('fabs-input-text', InputText);
customElements.define('fabs-list-view', ListView);
customElements.define('fabs-navbar', Navbar);
customElements.define('fabs-popup-view', PopupView);
customElements.define('fabs-split-view', SplitView);
customElements.define('fabs-table-view', TableView);
customElements.define('fabs-validated-input', ValidatedInput);
customElements.define('fabs-view', View);
customElements.define('fabs-button-symbol', ButtonSymbol);
customElements.define('fabs-checkbox', CheckBox);
