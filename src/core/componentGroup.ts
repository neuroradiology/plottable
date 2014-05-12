///<reference path="../reference.ts" />

module Plottable {
  export class ComponentGroup extends Component {
    private components: Component[];

    /**
     * Creates a ComponentGroup.
     *
     * @constructor
     * @param {Component[]} [components] The Components in the ComponentGroup.
     */
    constructor(components: Component[] = []){
      super();
      this.classed("component-group", true);
      this.components = components;
    }

    public requestedXY(x: number, y: number): IXYPacket {
      var layouts = this.components.map((c: Component) => c.requestedXY(x, y));
      var maxX = d3.max(layouts, (l: IXYPacket) => l.x);
      var maxY = d3.max(layouts, (l: IXYPacket) => l.y);
      return {
        x: maxX,
        y: maxY,
        unsatisfiedX: maxX > x,
        unsatisfiedY: maxY > y,
      }
    }

    public _addComponentToGroup(c: Component, prepend = false): ComponentGroup {
      if (prepend) {
        this.components.unshift(c);
      } else {
        this.components.push(c);
      }
      if (this.element != null) {
        c._anchor(this.content);
      }
      return this;
    }

    public merge(c: Component): ComponentGroup {
      this._addComponentToGroup(c);
      return this;
    }

    /**
     * If the given component exists in the ComponentGroup, removes it from the
     * group and the DOM.
     *
     * @param {Component} c The component to be removed.
     * @returns {ComponentGroup} The calling ComponentGroup.
     */
    public removeComponent(c: Component): ComponentGroup {
      var removeIndex = this.components.indexOf(c);
      if (removeIndex >= 0) {
        this.components.splice(removeIndex, 1);
        c.remove();
      }
      return this;
    }

    /**
     * Removes all Components in the ComponentGroup from the group and the DOM.
     *
     * @returns {ComponentGroup} The calling ComponentGroup.
     */
    public empty(): ComponentGroup {
      this.components.forEach((c: Component) => c.remove());
      this.components = [];
      return this;
    }

    public _anchor(element: D3.Selection): ComponentGroup {
      super._anchor(element);
      this.components.forEach((c) => c._anchor(this.content));
      return this;
    }

    public _computeLayout(xOrigin?: number,
                         yOrigin?: number,
                  availableX?: number,
                 availableY?: number): ComponentGroup {
      super._computeLayout(xOrigin, yOrigin, availableX, availableY);
      this.components.forEach((c) => {
        c._computeLayout(0, 0, this.availableX, this.availableY);
      });
      return this;
    }

    public _doRender() {
      super._doRender();
      this.components.forEach((c) => c._doRender());
      return this;
    }

    public isFixedWidth(): boolean {
      return this.components.every((c) => c.isFixedWidth());
    }

    public isFixedHeight(): boolean {
      return this.components.every((c) => c.isFixedHeight());
    }
  }
}
