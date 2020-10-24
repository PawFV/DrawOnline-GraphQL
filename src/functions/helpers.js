/**
 * Removes all active elements that don't match
 * with the selected HTML item and applies active class
 * @param {string} selectedItem - HTML clicked element name
 */
function toggleActive(selectedItem) {
  const toolbarItems = document.querySelectorAll('.pen, .eraser, .filler')
  toolbarItems.forEach(element => {
    const isSelectedItem = element.classList.contains(selectedItem)
    isSelectedItem
      ? element.classList.add('active-tool')
      : element.classList.remove('active-tool')
  })
}
/**
 * Checks type of prop and returns a valid CSS color.
 * @param {*} prop
 * @returns {string} valid css color
 */
function propColor(prop) {
  if (typeof prop === 'boolean') return 'blue'
  if (prop.toString().includes('#')) return prop
  if (typeof prop === 'object') return 'violet'
  if (typeof prop === 'number') return '#D0A342'
  return 'black'
}

export { toggleActive, propColor }
