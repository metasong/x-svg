// https://stackoverflow.com/questions/68155960/slotting-a-svg-inside-another-svg-in-a-web-component#answer-68159761
customElements.define(
  "x-svg",
  class extends HTMLElement {
    connectedCallback() {
      //.append(document.querySelector('template').content.cloneNode(true));
      this.attachShadow({ mode: "open" }).innerHTML = `
        <style>svg{ height:180px }</style>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" width="500" height="500">
          <circle cx="50%" cy="50%" r="50%" fill="red"></circle>
          <slot name="foo"></slot>
          <slot name="bar"></slot>
        </svg>
        `;
      setTimeout(() => {
        // make sure innerHTML is parsed
        let svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svg.innerHTML = this.innerHTML;
        svg
          .querySelectorAll("*")
          .forEach((el) =>
            this.shadowRoot
              .querySelector(`slot[name="${el.getAttribute("slot")}"]`)
              ?.replaceWith(el)
          );
          this.replaceChildren(); // remove all children
      });
    }
  }
);
