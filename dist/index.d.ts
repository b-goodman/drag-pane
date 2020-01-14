declare class DragPage extends HTMLElement {
    headerRef: HTMLDivElement;
    static get observedAttributes(): string[];
    constructor();
    connectedCallback(): void;
    get heading(): string;
    set heading(newState: string);
    get disabled(): boolean;
    set disabled(newState: boolean);
    get hideControls(): boolean;
    get minimized(): boolean;
    set minimized(newState: boolean);
    set color(newColor: string);
    get color(): string;
    get key(): string | undefined;
    set key(newValue: string | undefined);
    attributeChangedCallback(_name: string, _oldValue: string, _newValue: string): void;
    private defaultHeaderColor;
    private handleBtnClick;
    private handleDblCLick;
    private pos;
    private storePosition;
    private restorePosition;
    private didMove;
    private beginElementDrag;
    private elementDrag;
    private endElementDrag;
}
export default DragPage;
