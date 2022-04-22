export class SVGBase extends HTMLElement {
  element({
    tag,
    attributes = {},
    innerHTML = false,
    append = false,
  }) {
    // create an Element in SVG NameSpace
    const element = document.createElementNS("http://www.w3.org/2000/svg", tag);
    // read all { key:value } pairs and set as attribute
    Object.entries(attributes).forEach(([key, value]) =>
      element.setAttribute(key, value)
    );
    // add optional HTML
    if (innerHTML) element.innerHTML = innerHTML;
    if (append) element.append(...append);
    return element;
  }
}