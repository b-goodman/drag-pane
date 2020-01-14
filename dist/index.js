class DragPage extends HTMLElement {
    constructor() {
        super();
        this.defaultHeaderColor = "#2196F3";
        this.handleBtnClick = (event) => {
            if (!this.disabled) {
                const el = event.target;
                switch (el.id) {
                    case "close":
                        this.dispatchEvent(new Event("remove"));
                        this.remove();
                        break;
                    case "minimize":
                        this.minimized = !this.minimized;
                        this.dispatchEvent(new Event("toggleminimize", { bubbles: true, composed: true }));
                        break;
                    default:
                        break;
                }
            }
        };
        this.handleDblCLick = (_event) => {
            if (!this.disabled && !this.hideControls) {
                this.minimized = !this.minimized;
                this.dispatchEvent(new Event("toggleminimize", { bubbles: true, composed: true }));
            }
        };
        this.pos = { x: 0, y: 0 };
        this.didMove = false;
        this.beginElementDrag = (event) => {
            if (!this.disabled) {
                event.preventDefault();
                this.setAttribute("active", "true");
                this.pos.x = event.clientX;
                this.pos.y = event.clientY;
                document.onmouseup = this.endElementDrag;
                document.onmousemove = this.elementDrag;
            }
        };
        this.elementDrag = (event) => {
            event.preventDefault();
            const pos1 = this.pos.x - event.clientX;
            const pos2 = this.pos.y - event.clientY;
            this.pos.x = event.clientX;
            this.pos.y = event.clientY;
            this.didMove = true;
            this.dispatchEvent(new Event("dragstart", { bubbles: true, composed: true }));
            const newPosition = { top: this.offsetTop - pos2, left: this.offsetLeft - pos1 };
            this.style.top = newPosition.top + "px";
            this.style.left = newPosition.left + "px";
        };
        this.endElementDrag = () => {
            document.onmouseup = null;
            document.onmousemove = null;
            this.setAttribute("active", "false");
            if (this.didMove) {
                this.storePosition();
                this.dispatchEvent(new Event("dragend", { bubbles: true, composed: true }));
                this.didMove = false;
            }
        };
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
            margin-left: 10px;
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
                ${!this.hideControls ?
            `<div id="controls">
                        <div id="minimize" class="btn">-</div>
                        <div id="close" class="btn">x</div>
                    </div>`
            : ``}
            </div>
            <slot id="content"></slot>
        `;
        const shadowRoot = this.attachShadow({ mode: 'open' });
        shadowRoot.appendChild(template.content.cloneNode(true));
        this.headerRef = this.shadowRoot.querySelector("#header");
        this.restorePosition();
    }
    static get observedAttributes() {
        return ["heading", "disabled", "hide-controls", "minimized", "color"];
    }
    connectedCallback() {
        this.headerRef.addEventListener("mousedown", this.beginElementDrag);
        this.headerRef.addEventListener("dblclick", this.handleDblCLick);
        this.headerRef.querySelectorAll(".btn").forEach((btnEl) => btnEl.addEventListener("click", this.handleBtnClick));
    }
    get heading() {
        return this.getAttribute("heading") || "";
    }
    set heading(newState) {
        this.setAttribute("heading", newState);
    }
    get disabled() {
        return this.getAttribute("disabled") === "true" || this.hasAttribute("disabled") && this.getAttribute("disabled") === "";
    }
    set disabled(newState) {
        this.setAttribute('disabled', newState.toString());
    }
    get hideControls() {
        return this.getAttribute("hide-controls") === "true" || this.hasAttribute("hide-controls") && this.getAttribute("hide-controls") === "";
    }
    get minimized() {
        return this.getAttribute("minimized") === "true" || this.hasAttribute("minimized") && this.getAttribute("minimized") === "";
    }
    set minimized(newState) {
        newState ? this.setAttribute('minimized', "true") : this.removeAttribute('minimized');
    }
    set color(newColor) {
        this.setAttribute("color", newColor);
    }
    get color() {
        return this.getAttribute("color") || this.defaultHeaderColor;
    }
    get key() {
        return this.getAttribute("key") || undefined;
    }
    set key(newValue) {
        if (newValue) {
            this.setAttribute("key", newValue);
        }
        else {
            this.removeAttribute("key");
        }
    }
    attributeChangedCallback(_name, _oldValue, _newValue) {
        if (_name === "color") {
            this.headerRef.style.backgroundColor = _newValue;
        }
    }
    storePosition() {
        if (this.key) {
            window.localStorage.setItem(`drag-pane-${this.key}`, JSON.stringify(this.pos));
        }
    }
    restorePosition() {
        if (this.key) {
            const storeValue = window.localStorage.getItem(`drag-pane-${this.key}`);
            if (storeValue) {
                this.pos = JSON.parse(storeValue);
                this.style.top = this.pos.y + "px";
                this.style.left = this.pos.x + "px";
            }
        }
    }
}
window.customElements.define('drag-pane', DragPage);
export default DragPage;
//# sourceMappingURL=index.js.map