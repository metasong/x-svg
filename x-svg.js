// https://stackoverflow.com/questions/68155960/slotting-a-svg-inside-another-svg-in-a-web-component#answer-68159761
customElements.define(
  "x-svg",
  class extends HTMLElement {
    connectedCallback() {
      //.append(document.querySelector('template').content.cloneNode(true));
      this.attachShadow({ mode: "open" }).innerHTML = `
        <style>svg{ height:180px }</style>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" width="500" height="500">
          <slot></slot>
          <slot name="foo"></slot>
          <slot name="bar"></slot>
        </svg>
        `;

      // make sure innerHTML is parsed
      setTimeout(() => {
        const svg = this.shadowRoot.querySelector("svg");
        const defaultContent = svg.querySelector("slot:not([name])");
        // turn everything in lightDOM into SVG (correct SVG NameSpace)
        let svgChildren = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "svg"
        );
        svgChildren.innerHTML = this.innerHTML;

        svgChildren
          .querySelectorAll("*") // all children
          .forEach((el) => {
            const name = el.getAttribute("slot");
            if (name) {
              const slot = svg.querySelector(
                `slot[ name="${name}"]`
              );
              if (slot) {
                slot.replaceWith(el);
              } else {
                console.log(
                  `no slot of name (${name}) configured in template of ${this.tagName}`,
                  el
                );
              }
            } else {
              svg.insertBefore(el, defaultContent);
            }
          });

          defaultContent.remove(); // remove default slot

        // remove all children in lightDOM
        this.replaceChildren();
      });
    }
  }
);
