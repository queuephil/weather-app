const dom = (function () {
  //-------------------------------------------------------------------------
  const addElement = function addElement(
    parentSelector,
    htmlTag,
    innerHTML,
    attributes = {},
    eventListeners = {}, // click: (e) => e.target.classList.toggle('test')
  ) {
    const newElement = document.createElement(htmlTag)
    if (innerHTML !== '') newElement.innerHTML = innerHTML
    for (const [key, value] of Object.entries(attributes)) {
      newElement.setAttribute(key, value)
    }
    for (const [key, value] of Object.entries(eventListeners)) {
      newElement.addEventListener(key, value)
    }
    document.querySelector(parentSelector).appendChild(newElement)
  }
  //-------------------------------------------------------------------------
  const toggleVisibility = function toggleVisibility(nodes) {
    nodes.forEach((node) => {
      node.style.display = node.style.display === 'none' ? 'block' : 'none'
    })
  }
  return { addElement, toggleVisibility }
})()

export { dom }
