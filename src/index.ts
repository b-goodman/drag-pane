class DragPage extends HTMLElement {

    public headerRef: HTMLDivElement;

    static get observedAttributes() {
        return ["heading", "disabled", "hide-controls", "minimized", "color"];
    }

    constructor() {
        super();

        const style = `
        :root {
            width: auto;
        }
        
        :host {
            position: absolute;
            z-index: 9;
            background-color: #ffffff;
            text-align: center;
            border: 1px solid #000000;
            width: auto;
        }

        :host([active]) {
            z-index: 999;
        }

        :host([minimized]) ::slotted(*) {
            display: none;
        }

        :host([disabled]) #header {
            background-color: #9E9E9E;
            cursor: unset;
        }

        #header {
            display: flex;
            justify-content: space-between;
            padding: 10px;
            cursor: move;
            z-index: 10;
            background-color: #2196F3;
            color: #fff;
        }

        #heading {
            margin: 0 auto;
        }

        #controls {
            display: inline-flex;
        }

        .btn {
            line-height: 9px;
            width: 10px;
            height: 10px;
            border: 1px solid black;
            border-radius: 3px;
            box-shadow: 1px 1px black;
            cursor: pointer;
            color: white;
        }

        .btn:not(:last-of-type) {
            margin: 0 5px 0 0;
        }

        .btn:hover {
            box-shadow: -1px -1px black;
            border: 1px solid black;
            color: white;
        }

        :host([disabled]) .btn, :host([disabled]) .btn:hover {
            border: 1px solid #616161;
            box-shadow: inset 1px 1px black;
            color: #424242;
            cursor: unset;
        }

        .btn:active {
            box-shadow: inset 1px 1px black;
        }

        `;

        const template = document.createElement('template');
        template.innerHTML = `
            <style>${style}</style>
            <div id="header">
                <div id="heading">${this.heading}</div>
                ${ !this.hideControls ?
                    `<div id="controls">
                        <div id="minimize" class="btn">-</div>
                        <div id="close" class="btn">x</div>
                    </div>`
                    : ``}
            </div>
            <slot id="content"></slot>
        `;

        const shadowRoot = this.attachShadow({mode: 'open'});
        shadowRoot.appendChild(template.content.cloneNode(true));
        this.headerRef = this.shadowRoot!.querySelector<HTMLDivElement>("#header")!;
    }

    public connectedCallback() {
        this.headerRef.addEventListener("mousedown", this.beginElementDrag)
        this.headerRef.querySelectorAll<HTMLDivElement>(".btn").forEach( (btnEl) => btnEl.addEventListener("click", this.handleBtnClick))
    }

    public get heading(): string {
        return this.getAttribute("heading") || "";
    }

    public set heading(newState: string) {
        this.setAttribute("heading", newState);
    }

    public get disabled(): boolean {
        return this.getAttribute("disabled") === "true" || this.hasAttribute("disabled") && this.getAttribute("disabled") === ""
    }

    public set disabled(newState: boolean) {
        this.setAttribute('disabled', newState.toString());
    }

    public get hideControls(): boolean {
        return this.getAttribute("hide-controls") === "true" || this.hasAttribute("hide-controls") && this.getAttribute("hide-controls") === ""
    }

    public get minimized(): boolean {
        return this.getAttribute("minimized") === "true" || this.hasAttribute("minimized") && this.getAttribute("minimized") === ""
    }

    public set minimized(newState: boolean) {
        newState ? this.setAttribute('minimized', "true") : this.removeAttribute('minimized');
    }

    public set color(newColor: string) {
        this.setAttribute("color", newColor);
    }

    public get color(): string {
        return this.getAttribute("color") || this.defaultHeaderColor;
    }

    attributeChangedCallback(_name: string, _oldValue: string, _newValue: string) {
        if (_name === "color") {
            this.headerRef.style.backgroundColor = _newValue;
        }
    }

    private defaultHeaderColor: string = "#2196F3";

    private handleBtnClick = (event: MouseEvent) => {
        if (!this.disabled) {
            const el = event!.target as HTMLDivElement;
            switch (el.id) {
                case "close":
                    this.dispatchEvent(new Event("remove"));
                    this.remove();
                    break;
                case "minimize":
                    this.minimized = !this.minimized;
                    this.dispatchEvent(new Event("toggleminimize"));
                    break;
                default:
                    break;
            }
        }
    }

    private pos: {x: number, y: number} = {x:0, y:0};

    private didMove: boolean = false;
    // private moveThreshold: number = 5;

    private beginElementDrag = (event: MouseEvent) => {
        if (!this.disabled) {
            event.preventDefault();
            this.setAttribute("active", "true");
            // get the mouse cursor position at startup:
            this.pos.x = event.clientX;
            this.pos.y = event.clientY;
            document.onmouseup = this.endElementDrag;
            // call a function whenever the cursor moves:
            document.onmousemove = this.elementDrag;
        }
    }

    private elementDrag = (event: MouseEvent) => {
        event.preventDefault();
        // calculate the new cursor position:
        const pos1 = this.pos.x - event.clientX;
        const pos2 = this.pos.y - event.clientY;
        this.pos.x = event.clientX;
        this.pos.y = event.clientY;

        this.didMove = true;
        this.dispatchEvent(new Event("dragstart"));

        // set the element's new position:
        const newPosition = {top: this.offsetTop - pos2, left: this.offsetLeft - pos1};
        this.style.top = newPosition.top + "px";
        this.style.left = newPosition.left + "px";
    }

    private endElementDrag = () => {
        // release element
        document.onmouseup = null;
        document.onmousemove = null;
        this.setAttribute("active", "false");
        if (this.didMove) {
            this.dispatchEvent(new Event("dragend"));
            this.didMove = false;
        }
    }
}

window.customElements.define('drag-pane', DragPage);

export default DragPage;
